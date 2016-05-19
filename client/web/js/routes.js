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
                        $state.go('menu');
                    } else {
                        $state.go('login');
                    }
                }
            })
            .state('menu', {
                url: '/menu',
                templateUrl: 'client/web/views/menu.ng.html'
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

            .state('menu.addAccount', {
                url: '/addAccount',
                templateUrl: 'client/web/views/addAccount.ng.html',
                controller: 'addAccountController'
            })

            .state('menu.accountManagement', {
                url: '/accountManagement',
                templateUrl: 'client/web/views/accountManagement.ng.html',
                controller: 'accountManagementCtrl'
            })

            .state('menu.sepQuotes', {
                url: '/sepQuotes',
                templateUrl: 'client/web/views/sepquotes.ng.html'
            });
        
        $urlRouterProvider.otherwise('/menu');
    });