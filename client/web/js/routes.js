angular.module('web.routes', [])
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
                        $state.go('web.feed');
                    } else {
                        $state.go('login');
                    }
                }
            })
            .state('web', {
                url: '/web',
                templateUrl: 'client/web/views/menu.ng.html',
                controller: 'mainController'
            })

            .state('main', {
                url: '/main',
                templateUrl: 'client/web/views/main.ng.html',
                controller: 'mainController'
            })

            .state('login', {
                url: '/login',
                templateUrl: 'client/web/views/login.ng.html',
                controller: 'loginController'
            })

            .state('web.addAccount', {
                url: '/addAccount',
                templateUrl: 'client/web/views/addAccount.ng.html',
                controller: 'addAccountController'
            })

            .state('web.members', {
                url: '/members',
                templateUrl: 'client/web/views/members.ng.html',
                controller: 'accountManagementCtrl'
            })

            .state('web.settings', {
                url: '/settings',
                templateUrl: 'client/web/views/settings.ng.html',
                controller: 'accountManagementCtrl'
            })

            .state('web.profile', {
                url: '/profile',
                templateUrl: 'client/web/views/profile.ng.html'
            })

            .state('web.feed', {
                url: '/feed',
                templateUrl: 'client/web/views/feed.ng.html'
            })

            .state('web.betting', {
                url: '/betting',
                templateUrl: 'client/web/views/betting.ng.html',
                controller: 'accountManagementCtrl'
            })

            .state('sepQuotes', {
                url: '/sepQuotes',
                templateUrl: 'client/web/views/sepquotes.ng.html'
            });
        
        $urlRouterProvider.otherwise('/web/feed');
    });