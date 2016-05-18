angular.module('web.controllers', [])
    .controller('mainController', function ($scope, $meteor, $state) {
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login');
        }
    })

    .controller('loginController', function ($scope, $meteor, $state) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.login = function () {
            $meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    $scope.error = error.reason;
                    $scope.errorVisible = {'visibility': 'visible'};
                } else {
                    $state.go('main'); // Redirect user if login succeeds
                }
            });
        };
        $scope.error = '';
        $scope.errorVisible = {'visibility': 'hidden'};

        $scope.goToRemindPassword = function() {
            $state.go('forgotPassword');
        }
    })

///***************************accountMangementCtrl**************************************//
    .controller('accountManagementCtrl', function ($scope, $meteor, $state) {
        // $scope.temp_user = {
        //     email: '',
        //     fullName: ''
        // };

        // $scope.temp_pass = {
        //     oldPass: '',
        //     newPass: '',
        //     newPassCheck: ''
        // };
        
        $scope.subscribe('userData');

        $scope.helpers({
            accountje: function () {
                return Meteor.users.find();
            }
        });
    });