angular.module('web.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        
        $urlRouterProvider.otherwise('/main')
        
        $stateProvider
            .state('/', {
                url: '/',
                controller: function ($scope, $state) {
                    if (Meteor.userId()) {
                        $state.go('main');
                    } else {
                        $state.go('login');
                    }
                }
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
            });
            
    });