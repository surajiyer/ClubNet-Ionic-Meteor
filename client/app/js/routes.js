angular.module('app.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js

        $stateProvider
            .state('/', {
                url: '/'
            })

            //login page
            .state('login', {
                url: '/login',
                templateUrl: 'client/app/views/login.ng.html',
                controller: 'loginCtrl'
            })

            //register page
            // .state('register', {
            //     url: '/register',
            //     templateUrl: 'client/app/views/register.ng.html',
            //     controller: 'registerCtrl'
            // })

            //forgot password page
            .state('forgotPassword', {
                url: '/forgotpassword',
                templateUrl: 'client/app/views/forgotPassword.ng.html',
                controller: 'forgotPasswordCtrl'
            })

            //enrollment page
            .state('enroll', {
                url: '/enroll/:token',
                templateUrl: 'client/app/views/enrollment.ng.html',
                controller: 'resetPasswordCtrl'
            })

            //reset password page
            .state('resetpassword', {
                url: '/resetpassword/:token',
                templateUrl: 'client/app/views/resetPassword.ng.html',
                controller: 'resetPasswordCtrl'
            })

            //menu
            .state('menu', {
                url: '/side-menu',
                templateUrl: 'client/app/views/menu.ng.html',
                abstract: true,
                controller: 'menuCtrl'
            })

            //feed
            .state('menu.feed', {
                url: '/feed',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/feed.ng.html',
                        controller: 'feedCtrl'
                    }
                }
            })

            //settings
            .state('menu.settings', {
                url: '/settings',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/settings.ng.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            //profile 
            .state('menu.profile', {
                url: '/profile',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/profile.ng.html',
                        controller: 'profileCtrl'
                    }
                }
            })

            //chats
            .state('menu.chats', {
                url: '/chats',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/chats/chats.ng.html',
                        controller: 'chatsCtrl'
                    }
                }
            })

            //chat
            .state('menu.chat', {
                url: '/chats/:chatId',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/chats/chat.ng.html',
                        controller: 'chatCtrl'
                    }
                }
            })

        $urlRouterProvider.otherwise('/')
    })

    .run(function ($rootScope, $location, $state) {
        handleOpenURL = function handleOpenURL(url) {
            var token = url.substr(url.lastIndexOf('/') + 1);
            if (url.startsWith('clubnet://enroll')) {
                $state.go('enrollment', {"token": token});
            } else if (url.startsWith('clubnet://resetpassword')) {
                $state.go('resetPassword', {"token": token});
            } else {
                $state.go('login');
            }
        };

        $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
            // If already logged in, go directly to feed
            if((toState.name === "login" || toState.name === "/") && Meteor.userId()) {
                e.preventDefault(); // stop current execution
                return $state.go('menu.feed');
            }

            if (toState.name === "login"
                || toState.name === "enroll"
                || toState.name === "resetpassword"
                || toState.name === "forgotPassword") {
                return; // no need to redirect, continue to toState state
            }

            // now, redirect only not authenticated
            if (!Meteor.userId()) {
                e.preventDefault(); // stop current execution
                $state.go('login');
            }
        });
    });