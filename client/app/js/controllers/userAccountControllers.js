angular.module('userAccountControllers', [])
/**
 *  Register Controller: provides all functionality for the register screen of the app
 */
// .controller('registerCtrl', function ($scope, $meteor, $state) {
//     /**
//      * Credentials of the user
//      */
//     $scope.user = {
//         email: '',
//         password: ''
//     };
//     /**
//      * @summary Function to register a new user
//      */
//     $scope.register = function () {
//         if (!$scope.user.email)
//             throw new Meteor.Error('Account registration error: e-mail is not valid');
//         var newUser = {
//             email: $scope.user.email,
//             password: $scope.user.password,
//             profile: {
//                 firstName: "p",
//                 lastName: "1",
//                 type: "player",
//                 clubID: "club",
//                 teamID: "team1"
//             }
//         };
//         Meteor.call('addUser', newUser, function (err, result) {
//             if (err || !Match.test(result, String))
//                 throw new Meteor.Error('Account registration error: ' + err.reason);
//             Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
//                 if (error) throw new Meteor.Error(error.reason);
//                 $state.go('menu.feed'); // Redirect user if registration succeeds
//             });
//         });
//     };
// })

    /**
     *  Login Controller: provides all functionality for the login screen of the app
     */
    .controller('loginCtrl', function ($scope, $meteor, $state, CommonServices) {
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
            try {
                check($scope.user.email, String);
            } catch (e) {
                return CommonServices.showAlert('Invalid E-mail', 'Please provide a valid e-mail address');
            }

            try {
                check($scope.user.password, Match.Where(function (x) {
                    check(x, String);
                    return x.length > 0;
                }));
            } catch (e) {
                return CommonServices.showAlert('Invalid password', 'Please enter a valid password');
            }

            Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    // Show error message
                    if (error.error == 400 || error.error == 403) {
                        return CommonServices.showAlert('Incorrect Credentials', 'Username or Password does not match.');
                    } else {
                        return CommonServices.showAlert(error.error + ' ' + error.reason, error.message);
                    }
                }

                // Check if user is a PR user
                if (Meteor.user().profile.type == 'pr') {
                    Meteor.logout();
                    return CommonServices.showAlert('Not Authorized', 'Please use the Web interface to login.');
                }

                // Go to feed
                $state.go('menu.feed');
            });
        };

        /**
         * @summary Function to show the forgot password page
         */
        $scope.forgotPassword = function () {
            $state.go('forgotPassword');
        };
    })

    /**
     *  Forgot Password Controller: provides functionality for restoring forgotten password
     */
    .controller('forgotPasswordCtrl', function ($scope, $state, CommonServices) {
        /**
         * Information of the user who forgot his password
         */
        $scope.user = {
            email: ''
        };

        /**
         * @summary Function to send email to user to reset password
         */
        $scope.forgotPassword = function () {
            if (!SimpleSchema.RegEx.Email.test($scope.email)) {
                return CommonServices.showAlert('Invalid E-mail', 'Please provide a valid e-mail address');
            }

            Accounts.forgotPassword({email: $scope.email}, function () {
                CommonServices.showAlert('E-mail Sent', 'An E-mail has been sent to reset the password.');
                $state.go('login');
            });
        };
    })

    /**
     *  Reset Password Controller: provides all functionality for the reset password screen of the app
     */
    .controller('resetPasswordCtrl', function ($scope, $meteor, $state, $stateParams, CommonServices) {
        /**
         * Information of the user who forgot his password
         */
        $scope.user = {
            email: '',
            token: '',
            newPassword: '',
            confirmNewPassword: ''
        };

        /**
         * @summary Function to reset the users password
         */
        $scope.resetPassword = function () {
            if (!$scope.user.newPassword) {
                CommonServices.showAlert('Error', 'No new password specified');
            } else if (!$scope.user.confirmNewPassword) {
                CommonServices.showAlert('Error', 'Please confirm your new password');
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                CommonServices.showAlert("Error", "New passwords don't match");
            } else if (!CommonServices.checkPassword($scope.user.newPassword)) {
                CommonServices.showAlert('Weak Password', 'Password not strong enough. ' +
                    'It should contain at least 8 characters of which at least one alphabetical and one numeric.');
            } else {
                $meteor.resetPassword($stateParams.token, $scope.user.newPassword, function () {
                    $state.go('menu.feed');
                });
            }
        }
    })

    /**
     *  Profile Controller: provides all functionality for the Profile screen of the app
     */
    .controller('profileCtrl', function ($scope, $meteor, $state, CommonServices) {
        /**
         * Profile information
         */
        $scope.user = {
            email: '',
            firstName: '',
            lastName: ''
        };

        /**
         * Password information
         */
        $scope.password = {
            oldPass: '',
            newPass: '',
            newPassCheck: ''
        };

        /**
         * @summary Function to change the password
         */
        $scope.changePassword = function () {
            if ($scope.password.newPass != $scope.password.newPassCheck) {
                return CommonServices.showAlert("Error", "Passwords don't match.");
            }
            
            $meteor.changePassword($scope.password.oldPass, $scope.password.newPass).then(function () {
                CommonServices.showAlert("Success!", "Password changed successfully. Please login again.");
                Meteor.logout(function () {
                      //Some cleanup code
                      Object.keys(Session.keys).forEach(function(key){
                        Session.set(key, undefined);
                      });
                      Session.keys = {} // remove session keys
                      $scope.password.oldPass = '';
                      $scope.password.newPass = '';
                      $scope.password.newPassCheck = '';
                    $state.go('login');
                });
            }, function (error) {
                return CommonServices.showAlert('Error', error.reason);
            });
        };
    })