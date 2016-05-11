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
                    // If user is already logged in, go directly to feed
                    if (Meteor.userId()) {
                        $state.go('menu.feed');
                    } else {
                        $state.go('login');
                    }
                }
            })

            .state('login', {
                url: '/login',
                templateUrl: 'client/app/views/login.ng.html',
                controller: 'loginCtrl'
            })

            .state('register', {
                url: '/register',
                templateUrl: 'client/app/views/register.ng.html',
                controller: 'registerCtrl'
            })

            .state('menu', {
                url: '/side-menu',
                templateUrl: 'client/app/views/menu.ng.html',
                abstract: true,
                controller: 'menuCtrl'
            })

            .state('menu.feed', {
                url: '/feed',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/feed.ng.html',
                        controller: 'feedCtrl'
                    }
                }
            })

            .state('menu.settings', {
                url: '/settings',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/settings.ng.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('menu.profile', {
                url: '/profile',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/profile.ng.html',
                        controller: 'profileCtrl'
                    }
                }
            })

            .state('menu.polls', {
                url: '/polls',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/app/views/polls.ng.html',
                        controller: 'pollsCtrl'
                    }
                }
            })

        $urlRouterProvider.otherwise('/')
    });