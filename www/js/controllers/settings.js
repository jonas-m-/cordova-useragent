angular.module('hotvibes.controllers')

    .controller('SettingsProfileCtrl', function(
        $scope, $ionicLoading, $ionicModal, $q,
        __, Country, CityPicker, ErrorCode
    ) {
        $scope.settings = {
            city: $scope.currUser.city,
            country: { id: $scope.currUser.country },
            profile: { phoneNumber: $scope.currUser.profile.phoneNumber },
            email: $scope.currUser.email
        };

        $scope.$watch('settings.country', function(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }

            $scope.settings.city = '';
        });

        $scope.save = function() {
            $ionicLoading.show({ template: __('Please wait') + '..' });

            $scope.currUser.$update(
                FormUtils.getDirtyFields($scope.settings.form).settings

            ).then(
                function() {
                    $scope.currUser.city = $scope.settings.city;
                    $scope.currUser.country = $scope.settings.country.id;

                    if ($scope.settings.profile.phoneNumber != $scope.currUser.profile.phoneNumber) {
                        $scope.currUser.profile.phoneNumber = $scope.settings.profile.phoneNumber;
                        $scope.currUser.profile.isPhoneNumberConfirmed = false;
                    }

                    if ($scope.settings.email != $scope.currUser.email) {
                        $scope.currUser.email = $scope.settings.email;
                        $scope.currUser.profile.isEmailConfirmed = false;
                    }

                    $scope.settings.form.$setPristine();

                    $ionicLoading.show({
                        template: __('Saved'),
                        noBackdrop: true,
                        duration: 1000
                    });
                },
                $scope.onError

            ).finally(function() {
                $ionicLoading.hide();
            });
        };

        $scope.countries = Country.query();

        new CityPicker({
            getCountry: function() {
                return $scope.settings.country;
            },
            onCitySelected: function(city) {
                $scope.settings.city = city.label;
                $scope.settings.form.settings.city.$setDirty();
            }
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.password = {};
        $scope.changePassword = function() {
            $ionicLoading.show({ template: __('Please wait') + '..' });

            $scope.currUser.$update({
                password: $scope.password.new,
                _params: { oldPassword: $scope.password.old }

            }).then(
                function() {
                    $ionicLoading.show({
                        template: __('Password has been successfully changed'),
                        noBackdrop: true,
                        duration: 1000
                    });

                    $scope.logout();
                },
                function(error) {
                    var params = null;
                    if (error.data && error.data.code && error.data.code == ErrorCode.INVALID_CREDENTIALS) {
                        params = { message: __("Invalid password") }
                    }

                    $scope.onError(error, params);
                }

            ).finally(function() {
                $ionicLoading.hide();
            });
        };
    })

    .controller('SettingsAboutCtrl', function($scope, $ionicLoading, __, DataMap) {
        $scope.aboutMe = angular.copy($scope.currUser.profile);

        $scope.purposes = DataMap.purpose;
        $scope.selectables = [
            { id: 'maritalStatus', label: __('Status:'), options: DataMap.maritalStatus },
            { id: 'livesWith', label: __('Living'), options: DataMap.livesWith },
            { id: 'doesSmoke', label: __('Smoking'), options: DataMap.doesSmoke },
            { id: 'doesDrink', label: __('Drinking'), options: DataMap.doesDrink },
            { id: 'education', label: __('Education'), options: DataMap.education }
        ];

        $scope.save = function() {
            $ionicLoading.show({ template: __('Please wait') + '..' });

            var form = this.aboutMeForm,
                changes = { profile: FormUtils.getDirtyFields(form).aboutMe };

            $scope.currUser.$update(changes)
                .then(
                    function() {
                        $scope.currUser = angular.merge($scope.currUser, changes);
                        form.$setPristine();

                        $ionicLoading.show({
                            template: __('Saved'),
                            noBackdrop: true,
                            duration: 1000
                        });
                    },
                    $scope.onError

                ).finally(function() {
                    $ionicLoading.hide();
                });
        };
    })

    .controller('SettingsAlbumsCtrl', function($scope, $ionicPopover, $ionicPopup, $ionicLoading, __, Album) {
        $scope.albums = Album.query({ include: 'thumbUrl(size=w80h80)' });

        $scope.promptCreateAlbum = {
            albumName: null
        };

        $scope.createAlbum = function() {
            $ionicPopup.prompt({
                title: __('Add New Album'),
                subTitle: __('Enter album name'),
                template: '<input type="text" ng-model="promptCreateAlbum.albumName" required />',
                scope: $scope,
                buttons: [
                    { text: __('Cancel') },
                    {
                        text: '<b>' + __('Create') + '</b>',
                        type: 'button-positive',
                        onTap: function(event) {
                            if (!$scope.promptCreateAlbum.albumName) {
                                event.preventDefault();
                                // TODO: show error
                                return null;
                            }

                            return $scope.promptCreateAlbum.albumName;
                        }
                    }
                ]

            }).then(function(name) {
                if (!name) {
                    return;
                }

                $ionicLoading.show({ template: __('Please wait') + '..' });

                var album = new Album({ name: name });
                album.$save().then(
                    function() {
                        $scope.albums.push(album);
                    },

                    $scope.onError

                ).finally(function() {
                    $ionicLoading.hide();
                });
            });
        };
    })

    .controller('SettingsAlbumCtrl', function(
        $scope, $stateParams, $ionicHistory, $ionicLoading, $ionicPopover,
        __, MediaFile, Album, Rule, ErrorCode
    ) {
        var thumbParams = 'size=w80h80';

        $scope.album = Album.get({
            id: $stateParams.albumId,
            include: 'photos.url(' + thumbParams + ')'
        });

        $scope.album.$promise.then(function() {
            $scope.album.photos = $scope.album.photos.map(function(photo) {
                return new MediaFile(photo);
            });
        });

        $scope.zoomPhoto = function($index) {
            $scope.popover.hide();

            // TODO
        };

        $scope.setAsMain = function($index) {
            $scope.popover.hide();

            $scope.album.photos.forEach(function(photo, photoIndex) {
                if (photo.isMain) {
                    $scope.album.photos[photoIndex].isMain = false;
                }
            });

            $scope.album.photos[$index].isMain = true;
            $scope.album.photos[$index].$update({ isMain: true });
        };

        $scope.deletePhoto = function($index) {
            $scope.popover.hide();
            $scope.album.photos[$index].$delete();
            delete $scope.album.photos[$index];
        };

        $scope.photoOptions = function($index, $event) {
            $scope.$current = $index;

            $ionicPopover.fromTemplateUrl('templates/popover_photo_options.html', {
                scope: $scope,
                animation: 'slide-in-up'

            }).then(function(popover) {
                $scope.popover = popover;
                popover.show($event);
            });
        };

        var filePicker;

        $scope.$on('$ionicView.afterEnter', function() {
            filePicker = document.querySelector('ion-view[nav-view="active"] #file-picker');
            filePicker.removeEventListener('change');
            filePicker.addEventListener('change', function(event) {
                $ionicLoading.show({ template: __('Uploading') + '..' });

                var file = new MediaFile({
                    albumId: $stateParams.albumId,
                    file: event.target.files[0]
                });

                // Upload the file
                file.$save().then(function(uploadedPhoto) {
                    // Display the newly uploaded file
                    $scope.album.photos.push(uploadedPhoto);

                }, function(error) {
                    if (
                        error.status == 400
                        && error.data.rule
                        && error.data.rule.type == Rule.MIN_VALUE
                        && (error.data.rule.field == 'width' || error.data.rule.field == 'height')
                    ) {
                        error.data.code = ErrorCode.IMAGE_SIZE_INVALID
                    }

                    $scope.onError(error);

                }).finally(function() {
                    $ionicLoading.hide();
                    // TODO: reset the value of the file input field because after failing to upload the user might try again and the value of the field wont change if the same photo is selected thus nothing will happen
                });
            });
        });

        $scope.openFilePicker = function() {
            setTimeout(function() {
                ionic.trigger('click', { target: filePicker });
            }, 50);
        };

        $scope.deleteAlbum = function() {
            $scope.album.$delete();
            //$rootScope.$broadcast('');
            // FIXME: notify albums list about deleted element

            $ionicHistory.goBack();
        };
    });