angular.module('app.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js


        $stateProvider
            .state('/', {
                url: '/',
                controller: 'mainCtrl'
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

            .state('menu.polls', {
                url: '/polls',
                views: {
                    'side-menu-content': {
                        templateUrl: 'client/views/polls.ng.html',
                        controller: 'pollsCtrl'
                    }
                }
            })

        $urlRouterProvider.otherwise('login')
    });