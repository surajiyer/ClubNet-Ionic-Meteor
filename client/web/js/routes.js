angular.module('web.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js

        /**
         *       Routes for the web interface
         */

        $stateProvider
            .state('/', {
                url: '/',
                controller: function ($scope, $state) {

                    // If user logged in
                    if (Meteor.userId()) {
                        $state.go('web.feed');
                    } else {
                        $state.go('login');
                    }
                }
            })

            // Enroll page
            .state('enroll', {
                url: '/enroll/:token',
                templateUrl: 'client/web/views/enroll.ng.html'
            })

            // Just the menu view
            .state('web', {
                url: '/web',
                templateUrl: 'client/web/views/menu.ng.html',
                controller: 'mainCtrl'
            })

            // Main
            .state('main', {
                url: '/main',
                templateUrl: 'client/web/views/main.ng.html',
                controller: 'mainCtrl'
            })
            
            // Login
            .state('login', {
                url: '/login',
                templateUrl: 'client/web/views/login.ng.html',
                controller: 'loginCtrl'
            })

            // Adding members
            .state('web.addAccount', {
                url: '/addAccount',
                templateUrl: 'client/web/views/addAccount.ng.html',
                controller: 'addAccountCtrl'
            })
            
            // Editing members
            .state('web.editAccount', {
                url: '/editAccount/:userID',
                templateUrl: 'client/web/views/editAccount.ng.html',
                controller: 'editAccountCtrl'
            })

            // Member management
            .state('web.members', {
                url: '/members',
                templateUrl: 'client/web/views/members.ng.html',
                controller: 'accountManagementCtrl'
            })

            // Club settings
            .state('web.settings', {
                url: '/settings',
                templateUrl: 'client/web/views/settings.ng.html',
                controller: 'settingsCtrl'
            })

            // User profile
            .state('web.profile', {
                url: '/profile',
                templateUrl: 'client/web/views/profile.ng.html',
                controller: 'profileCtrl'
            })

            // Feed
            .state('web.feed', {
                url: '/feed',
                templateUrl: 'client/web/views/feed.ng.html'
            })

            // Club betting
            .state('web.betting', {
                url: '/betting',
                templateUrl: 'client/web/views/betting.ng.html',
                controller: 'accountManagementCtrl'
            })

            // Extra: quotes
            .state('web.sepquotes', {
                url: '/sepquotes',
                templateUrl: 'client/web/views/sepquotes.ng.html'
            });

        $urlRouterProvider.otherwise('/');
    })
    .run(function($rootScope, $location, $state) {
        $rootScope.$on( '$stateChangeStart', function(e, toState  , toParams
                                                    , fromState, fromParams) {
            console.log('redirect check');
            console.log('e');
            console.log(e);
            console.log('toState');
            console.log(toState);
            console.log('fromState');
            console.log(fromState);
            if(toState.name === "login"){
                return; // no need to redirect
            }

            // now, redirect only not authenticated
            if (!Meteor.userId()) {
                e.preventDefault(); // stop current execution
                $state.go('login');
            }
        });
    });