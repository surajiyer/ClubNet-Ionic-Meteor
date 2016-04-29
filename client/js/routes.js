angular.module('app.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider.state('login', {
                url: '/login',
                templateUrl: 'client/views/login.ng.html',
                controller: 'loginCtrl'
            })

            .state('tabs', {
                url: '/tabs',
                templateUrl: 'client/views/templates/tabs.ng.html',
                abstract: true,
            })

            .state('tabs.home', {
                url: '/feed',
                views: {
                    'feed-tab': {
                        templateUrl: 'client/views/feed.ng.html',
                        controller: 'feedCtrl'
                    }
                }
            })

            .state('tabs.settings', {
                url: '/settings',
                views: {
                    'settings-tab': {
                        templateUrl: 'client/views/settings.ng.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('menu', {
                url: '/side-menu21',
                templateUrl: 'client/views/menu.ng.html',
                abstract: true
            })

            .state('menu.polls', {
                url: '/polls',
                views: {
                    'side-menu21': {
                        templateUrl: 'client/views/polls.ng.html',
                        controller: 'pollsCtrl'
                    }
                }
            });

        $urlRouterProvider.otherwise('login');
    });