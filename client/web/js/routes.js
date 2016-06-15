angular.module('web.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {
        /**
         * Routes for the web interface. Uses AngularUI Router.
         */
        $stateProvider
            .state('/', {
                url: '/',
                controller: function ($scope, $state) {

                    // If user logged in
                    if (Meteor.userId()) {
                        $state.go('web.members');
                    } else {
                        $state.go('login');
                    }
                }
            })

            // Enroll page
            .state('enroll', {
                url: '/enroll/:token',
                templateUrl: 'client/web/views/enroll.ng.html',
                controller: 'enrollCtrl'
            })

            // Reset password page
            .state('reset', {
                url: '/resetpassword/:token',
                templateUrl: 'client/web/views/reset.ng.html',
                controller: 'enrollCtrl'
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

            // Redirect to application
            .state('redirect', {
                url: '/redirect/:sort/:token',
                templateUrl: 'client/web/views/redirectToApp.ng.html',
                controller: 'redirectCtrl'
            });

        $urlRouterProvider.otherwise('/');
    })

    .run(function($rootScope, $location, $state) {
        $rootScope.$on( '$stateChangeStart', function(e, toState  , toParams
                                                    , fromState, fromParams) {
            if(toState.name === "login" || toState.name === "enroll" || toState.name === "reset"){
                return; // no need to redirect
            }

            // now, redirect only not authenticated
            if (!Meteor.userId()) {
                e.preventDefault(); // stop current execution
                $state.go('login');
            }
        });
    });