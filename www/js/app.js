if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
    };
}

Array.prototype.toggleElement = function(element) {
    var index = this.indexOf(element);

    if (index > -1) {
        this.splice(index, 1);

    } else {
        this.push(element);
    }
};

angular.module('hotvibes', [
    'ionic', 'ion-autocomplete', 'angularMoment', 'ngFabForm', 'ionic.contrib.ui.tinderCards',
    'hotvibes.filters', 'hotvibes.controllers', 'hotvibes.services', 'hotvibes.directives'
])

    .constant('ErrorCode', {
        NOT_ENOUGH_CREDITS: 101,
        VIP_REQUIRED: 102,
        MEMBER_HAS_BLOCKED_YOU: 104
    })

    .constant('Rule', {
        MIN_VALUE: 'minValue'
    })

    .config(function($stateProvider, $urlRouterProvider, $httpProvider, $resourceProvider/*, $cacheFactoryProvider*/, ngFabFormProvider) {
        // Setup default URL
        $urlRouterProvider.otherwise('/users');

        // Add HTTP interceptor so we could read/write headers on each request
        $httpProvider.interceptors.push('HttpInterceptor');

        /*var cache = $cacheFactoryProvider.$get()('resourceCache', { capacity: 100 });
        $resourceProvider.defaults.actions.get.cache = cache;*/
        $resourceProvider.defaults.actions.update = { method: 'PUT' };
        $resourceProvider.defaults.actions.query.interceptor = {
            response: function(response) {
                response.resource.$metadata = {
                    moreAvailable: (response.headers('X-Limit-MoreAvailable') ? true : false)
                };

                /*angular.forEach(response.resource, function(object) {
                    if (!object.id) {
                        return;
                    }

                    cache.put(response.config.url + '/' + object.id, object);
                });*/

                return response;
            }
        };

        ngFabFormProvider.setInsertErrorTplFn(function(compiledAlert, el, attrs) {
            var label = el.parent()[0].getElementsByClassName('input-label');
            if (label) {
                label[0].appendChild(compiledAlert);

            } else {
                el.after(compiledAlert);
            }
        });

        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: 'LoginCtrl',
                onEnter: function($state, AuthService) {
                    if (AuthService.isUserLoggedIn()) {
                        $state.go('inside.users');
                    }
                }
            })

            .state('inside', {
                abstract: true,
                cache: false,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl',
                onEnter: function($state, AuthService) {
                    if (!AuthService.isUserLoggedIn()) {
                        $state.go('login');
                    }
                }
            })

            .state('inside.users', {
                url: "/users",
                views: {
                    main: {
                        templateUrl: "templates/users.html",
                        controller: 'UsersCtrl'
                    },
                    rightMenu: {
                        templateUrl: "templates/users-filter.html",
                        controller: 'UsersFilterCtrl'
                    }
                }
            })

            .state('inside.user', {
                url: "/users/:userId",
                views: {
                    main: {
                        templateUrl: "templates/user.html",
                        controller: 'UserCtrl'
                    },
                    'tabContent@inside.user': {
                        // Dirty hack to make nav bar work properly
                        templateUrl: "templates/user_index.html"
                    }
                }
            })

            .state('inside.user.photos', {
                url: "/photos",
                views: {
                    tabContent: {
                        templateUrl: "templates/user_photos.html",
                        controller: 'UserPhotosCtrl'
                    }
                }
            })

            .state('inside.user.about', {
                url: "/about",
                views: {
                    tabContent: {
                        templateUrl: "templates/user_about.html",
                        controller: 'UserAboutCtrl'
                    }
                }
            })

            .state('inside.user.actions', {
                url: "/actions",
                views: {
                    tabContent: {
                        templateUrl: "templates/user_actions.html",
                        controller: 'UserActionsCtrl'
                    }
                }
            })

            .state('inside.user.chat', {
                url: "/chat",
                views: {
                    tabContent: {
                        templateUrl: "templates/conversation.html",
                        controller: 'ConversationCtrl'
                    }
                }
            })

            .state('inside.conversations', {
                url: "/conversations",
                views: {
                    main: {
                        templateUrl: "templates/conversations.html",
                        controller: 'ConversationsCtrl'
                    }
                }
            })

            .state('inside.conversations-single', {
                url: "/conversations/:id",
                views: {
                    main: {
                        templateUrl: "templates/conversation.html",
                        controller: 'ConversationCtrl'
                    }
                }
            })

            .state('inside.guests', {
                url: "/guests",
                views: {
                    main: {
                        templateUrl: "templates/users.html",
                        controller: 'GuestsCtrl'
                    }
                }
            })

            .state('inside.friends', {
                url: "/friends",
                views: {
                    main: {
                        templateUrl: "templates/users.html",
                        controller: 'FriendsCtrl'
                    }
                }
            })

            .state('inside.blockedUsers', {
                url: "/blocklist",
                views: {
                    main: {
                        templateUrl: "templates/users.html",
                        controller: 'BlockedUsersCtrl'
                    }
                }
            })

            .state('inside.chatRoom', {
                url: "/chatRooms/:id",
                views: {
                    main: {
                        templateUrl: "templates/chat_room.html",
                        controller: 'ChatRoomCtrl'
                    }
                }
            })

            .state('inside.settings', {
                url: "/settings",
                views: {
                    main: {
                        templateUrl: "templates/settings.html"
                    }
                }
            })

            .state('inside.settings-credits', {
                url: "/settings/credits",
                views: {
                    main: {
                        templateUrl: "templates/settings_credits.html"/*,
                        controller: 'SettingsProfileCtrl'*/
                    }
                }
            })

            .state('inside.settings-profile', {
                url: "/settings/profile",
                views: {
                    main: {
                        templateUrl: "templates/settings_profile.html",
                        controller: 'SettingsProfileCtrl'
                    }
                }
            })

            .state('inside.settings-about', {
                url: "/settings/aboutMe",
                views: {
                    main: {
                        templateUrl: "templates/settings_about.html",
                        controller: 'SettingsAboutCtrl'
                    }
                }
            })

            .state('inside.settings-albums', {
                url: "/settings/albums",
                views: {
                    main: {
                        templateUrl: "templates/settings_albums.html",
                        controller: 'SettingsAlbumsCtrl'
                    },
                    'mainAlbum@inside.settings-albums' : {
                        templateUrl: "templates/settings_album.html",
                        controller: 'SettingsAlbumCtrl'
                    }
                },
                params: {
                    albumId: 0
                }
            })

            .state('inside.settings-albums-single', {
                url: "/settings/albums/:albumId",
                views: {
                    main: {
                        templateUrl: "templates/settings_album.html",
                        controller: 'SettingsAlbumCtrl'
                    }
                }
            })

            .state('inside.quickie', {
                abstract: true,
                views: {
                    main: {
                        templateUrl: "templates/quickie.html"
                    }
                }
            })

            .state('inside.quickie.swipe', {
                url: "/quickie",
                views: {
                    quickieSwipe: {
                        templateUrl: "templates/quickie_swipe.html",
                        controller: 'QuickieSwipeCtrl'
                    }
                }
            })

            .state('inside.quickie.listSaidYes', {
                url: "/quickie/saidYes",
                views: {
                    quickieSaidYes: {
                        templateUrl: "templates/quickie_list.html",
                        controller: 'QuickieYesCtrl'
                    }
                }
            })

            .state('inside.quickie.listMatches', {
                url: "/quickie/matches",
                views: {
                    quickieMatches: {
                        templateUrl: "templates/quickie_list.html",
                        controller: 'QuickieMatchesCtrl'
                    }
                }
            })

            .state('inside.notifications', {
                url: "/notifications",
                views: {
                    main: {
                        templateUrl: "templates/notifications.html",
                        controller: 'NotificationsCtrl'
                    }
                }
            });
    })

    .run(function($ionicPlatform, AuthService) {
        AuthService.init();

        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }

            // TODO:
            /*$ionicPlatform.on('offline', function() {

            });*/

            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    });