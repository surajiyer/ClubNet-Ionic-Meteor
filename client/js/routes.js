angular.module('app.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        
        $stateProvider
            .state('/', {
                url: '/',
                controller: function ($scope, $state) {
                    if (Meteor.userId()) {
                        $state.go('menu.feed');
                    } else {
                        $state.go('login');
                    }
                }
            })

            .state('login', {
                url: '/login',
                templateUrl: 'client/views/login.ng.html',
                controller: 'loginCtrl'
            })

            .state('register', {
                url: '/register',
                templateUrl: 'client/views/register.ng.html',
                controller: 'registerCtrl'
            })

            .state('forgotPassword', {
                url: '/forgotpassword',
                templateUrl: 'client/views/forgotPassword.ng.html',
                controller: 'forgotPasswordCtrl'
            })

            .state('menu', {
                url: '/side-menu',
                templateUrl: 'client/views/menu.ng.html',
                abstract: true,
                controller: 'menuCtrl'
            })

            .state('menu.feed', {
                url: '/feed',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/views/feed.ng.html',
                        controller: 'feedCtrl'
                    }
                }
            })

            .state('menu.settings', {
                url: '/settings',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/views/settings.ng.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('menu.profile', {
                url: '/profile',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/views/profile.ng.html',
                        controller: 'profileCtrl'
                    }
                }
            })

            .state('menu.polls', {
                url: '/polls',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/views/polls.ng.html',
                        controller: 'pollsCtrl'
                    }
                }
            })

        $urlRouterProvider.otherwise('/')
    });