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
    .controller('loginCtrl', function ($scope, $meteor, $state, CommonServices, $translate) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };

        /**
         * @summary Function for validating user login input
         */
        var validateInput = function (x) {
            check(x, String);
            return x.length > 0;
        };

        var ERROR = 'Error';

        try {
            check($scope.user.email, Match.Where(validateInput));
        } catch (e) {
            $translate('MISSING_VALID_EMAIL_MESSAGE').then(function (result) {
                CommonServices.showAlert(ERROR, result);
            });
            return;
        }

        try {
            check($scope.user.password, Match.Where(validateInput));
        } catch (e) {
            $translate('MISSING_PASSWORD').then(function (result) {
                CommonServices.showAlert(ERROR, result);
            });
            return;
        }

        Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
            if (error) {
                $translate('INCORRECT_CREDENTIALS').then(function (result) {
                    // Show error message
                    if (error.error == 400 || error.error == 403) {
                        CommonServices.showAlert(ERROR, result);
                    } else {
                        CommonServices.showAlert(error.error + ' ' + error.reason, error.message);
                    }
                });
                return;
            }

            // Check if user is a PR user
            if (Meteor.user().profile.type == 'pr') {
                Meteor.logout();
                $translate('NOT_AUTHORIZED').then(function (result) {
                    CommonServices.showAlert(ERROR, result);
                });
                return;
            }

            // Go to feed
            window.location.replace("/");
        });

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
    .controller('forgotPasswordCtrl', function ($scope, $state, CommonServices, $translate) {
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
            if (!SimpleSchema.RegEx.Email.test($scope.user.email)) {
                $translate(['ERROR', 'MISSING_VALID_EMAIL']).then(function (translations) {
                    head = translations.ERROR;
                    var content = translations.MISSING_VALID_EMAIL;
                    CommonServices.showAlert(head, content);
                });
                return;
            }

            Accounts.forgotPassword({email: $scope.user.email}, function () {
                $translate(['ERROR', 'PWD_RECOVERY_EMAIL_SENT']).then(function (translations) {
                    head = translations.ERROR;
                    var content = translations.PWD_RECOVERY_EMAIL_SENT;
                    CommonServices.showAlert(head, content);
                });
                
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

        var ERROR = 'Error';

        /**
         * @summary Function to reset the users password
         */
        $scope.resetPassword = function () {
            if (!$scope.user.newPassword) {
                return CommonServices.showAlert(ERROR, 'No new password specified');
            } else if (!$scope.user.confirmNewPassword) {
                return CommonServices.showAlert(ERROR, 'Please confirm your new password');
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                return CommonServices.showAlert(ERROR, "New passwords don't match");
            } else if (!CommonServices.checkPassword($scope.user.newPassword)) {
                return CommonServices.showAlert('Weak Password', 'Password not strong enough. ' +
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
    .controller('profileCtrl', function ($scope, $meteor, $state, CommonServices, $translate) {
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
                $translate(['ERROR', 'PWD_NOT_MATCH']).then(function (translations) {
                    head = translations.ERROR;
                    var content = translations.PWD_NOT_MATCH;
                    CommonServices.showAlert(head, content);
                });
                return;
            }

            var testPassword = CommonServices.checkPassword($scope.password.newPass);
            if (!testPassword) {
                $translate(['ERROR', 'PWD_NOT_VALID']).then(function (translations) {
                    head = translations.ERROR;
                    var content = translations.PWD_NOT_VALID;
                    CommonServices.showAlert(head, content);
                });
                return;
            }

            $meteor.changePassword($scope.password.oldPass, $scope.password.newPass).then(function () {
                $translate(['SUCCESS', 'PWD_RESET_SUCCESS']).then(function (translations) {
                    head = translations.SUCCESS;
                    var content = translations.PWD_RESET_SUCCESS;
                    CommonServices.showAlert(head, content);
                });
                Meteor.logout(function () {
                    $state.go('login');
                });
            }, function (error) {
                $translate('ERROR').then(function () {

                });
                return CommonServices.showAlert('Error', error.reason);
            });
        };
    })