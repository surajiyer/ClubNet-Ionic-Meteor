angular.module('userAccountControllers', [])

    /**
     *  Register Controller: provides all functionality for the register screen of the app
     */
    .controller('registerCtrl', function ($scope, $meteor, $state) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };
        /**
         * @summary Function to register a new user
         */
        $scope.register = function () {
            if (!$scope.user.email)
                throw new Meteor.Error('Account registration error: e-mail is not valid');
            var newUser = {
                email: $scope.user.email,
                password: $scope.user.password,
                profile: {
                    firstName: "p",
                    lastName: "1",
                    type: "player",
                    clubID: "club",
                    teamID: "team1"
                }
            };
            Meteor.call('addUser', newUser, function (err, result) {
                if (err || !Match.test(result, String))
                    throw new Meteor.Error('Account registration error: ' + err.reason);
                Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                    if (error) throw new Meteor.Error(error.reason);
                    $state.go('menu.feed'); // Redirect user if registration succeeds
                });
            });
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the app
     */
    .controller('loginCtrl', function ($scope, $meteor, $state) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };
        /**
         * @summary Function for a user to login
         */
        $scope.login = function () {
            Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    throw new Meteor.Error(error.reason);
                }
                $state.go('menu.feed');
            });
        };

        /**
         * @summary Function to show the forgot password page
         */
        $scope.goToRemindPassword = function () {
            $state.go('forgotPassword');
        }
    })

    /**
     *  Forgot Password Controller: provides all functionality for the forgot password screen of the app
     */
    .controller('forgotPasswordCtrl', function ($scope) {
        /**
         * Information of the user who forgot his password
         */
        $scope.forgotUser = {
            email: '',
            token: '',
            newPassword: ''
        };

        /**
         * @summary Function to reset the users password
         */
        $scope.resetPassword = function () {
            Accounts.resetPassword($scope.forgotUser.token, $scope.forgotUser.newPassword, function (err) {
                if (err) throw new Meteor.Error('Forgot password error: ' + err.reason);
                console.log('Reset password success');
            });
        };

        /**
         * @summary Function to send email to user to reset password
         */
        $scope.forgotPassword = function () {
            if (!$scope.forgotUser.email)
                throw new Meteor.Error('PLEASE ENTER EMAIL ADDRESS U BITCH'); // Nice error +1
            Accounts.forgotPassword({email: $scope.forgotUser.email}, function (err) {
                if (err) throw new Meteor.Error('Forgot password error: ' + err.reason);
            });
        };
    })

    /**
     *  Profile Controller: provides all functionality for the Profile screen of the app
     */
    .controller('profileCtrl', function ($scope, $meteor, $state) {
        /**
         * Profile information
         */
        $scope.temp_user = {
            email: '',
            firstName: '',
            lastName: ''
        };

        /**
         * Password information
         */
        $scope.temp_pass = {
            oldPass: '',
            newPass: '',
            newPassCheck: ''
        };

        /**
         * @summary Function to change the profile information
         */
        $scope.changeGeneralProfileInfo = function () {
            var email = $scope.temp_user.email;
        };

        /**
         * @summary Function to change the password
         */
        $scope.changePassword = function () {
            if ($scope.temp_pass.newPass == $scope.temp_pass.newPassCheck) {
                $meteor.changePassword($scope.temp_pass.oldPass, $scope.temp_pass.newPass).then(function () {
                    console.log('Change password success');
                    $state.go('menu.feed');
                }, function (error) {
                    $scope.error = error.reason;
                    $scope.errorVisible = {'visibility': 'visible'};
                    console.log('Error changing password - ', error);
                });
            } else {
                $scope.error = "The passwords don't match.";
            }
        };

        /**
         * Data for error message
         */
        $scope.error = '';
        $scope.errorVisible = {'visibility': 'hidden'};
    })