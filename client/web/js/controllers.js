angular.module('web.controllers', [])
    .controller('mainCtrl', function ($scope, $meteor, $state) {
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login');
        }
    })

    .controller('loginCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.login = function () {
            $meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    $scope.error = error.reason;
                    $scope.errorVisible = true;
                } else {
                    $state.go('web.feed'); // Redirect user if login succeeds
                }
            });
        };
        $scope.error = '';
        $scope.errorVisible = false;

        $scope.goToRemindPassword = function() {
            $state.go('forgotPassword');
        }
    })


    .controller('sepQuotesCtrl', function ($scope, $meteor, $state) {

    })


    .controller('addAccountCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            firstName: '',
            lastName: '',
            email: ''
        };

        alert(email);

        $scope.addAccount = function () {
            if (!$scope.user.email)
                throw new Meteor.Error('Account registration error: e-mail is not valid');
            var newUser = {
                email: $scope.user.email,
                password: "dev",
                profile: {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    type: 'general',
                    clubID: "PSV"
                }
            };
            console.log(newUser);
            Meteor.call('addUser', newUser, function (err, result) {
                console.log('nu zijn we hier jonguh');
                if (err) {
                    console.log(err);
                } else {
                    console.log("User added");
                    $state.go('web.members'); // Redirect user if registration succeeds
                }
            });

        };
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
            userAccounts: function () {
                return Meteor.users.find();
            }
        });
    });