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
                    $state.go('web.feed'); // Redirect user if login succeeds
                }
            });
        };
        $scope.error = '';
        $scope.errorVisible = {'visibility': 'hidden'};

        $scope.goToRemindPassword = function() {
            $state.go('forgotPassword');
        }
    })


    .controller('sepQuotesCtrl', function ($scope, $meteor, $state) {

    })


    .controller('addAccountCtrl', function ($scope, $meteor, $state) {

        $scope.temp_account = {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            accountType: '',
            playerTeam: ''
        };

        $scope.addAccount = function () {
            var firstName = $scope.temp_account.firstName;
            var lastName = $scope.temp_account.lastName;
            var email = $scope.temp_account.email;
            var password = $scope.temp_account.password;
            var accountType = $scope.temp_account.accountType;
            var playerTeam = $scope.temp_account.playerTeam;

            alert (firstName);
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


        $scope.subscribe('userManagement');

        $scope.helpers({
            userAccounts: function () {
                return Meteor.users.find();
            }
        });
    });