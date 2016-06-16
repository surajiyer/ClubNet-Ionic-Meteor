angular.module('web.userAccountControllers', [])

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     */
    .controller('accountManagementCtrl', function ($scope, $modal, $state) {

        $scope.autorun(function () {
            if(Meteor.userId()) {
                $scope.subscribe('userData', null, () => {
                    $state.reload();
                });
            }
        });

        $scope.helpers({
            userAccounts: function () {
                return Meteor.users.find({}, {sort: {'profile.lastName': 1}});
            }
        });

        $scope.deleteAccount = function (user) {
            if (user.type !== 'pr') {
                Meteor.users.remove(user._id);
            }
        };

        // Open the delete modal
        $scope.delete = function (user) {
            $scope.selectedUser = user;
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'client/web/views/deleteAccountModal.ng.html',
                controller: 'DeleteModalInstanceCtrl',
                size: '',
                resolve: {
                    selectedUser: function () {
                        return $scope.selectedUser;
                    }
                }
            });

            // Show when modal was closed in console
            modalInstance.result.then(function (selectedUser) {
                Meteor.users.remove(selectedUser._id);
            }, function () {
                // Modal dismissed
            });
        };

        // Go to the edit screen
        $scope.edit = function (user) {
            $state.go('web.editAccount', {'userID': user._id});
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('loginCtrl', function ($scope, $meteor, $state, $modal, $translate) {

        /**
         *  Filled in credentials by the user
         */
        $scope.user = {
            email: '',
            password: ''
        };

        /**
         * @summary Function for logging in a user
         * First, the function tries to sign in using the email and password that was filled in by the user.
         * If correct PR credentials, the user is redirected to the web interface feed page.
         * If incorrect credentials or user type is not PR, a generic error message is returned.
         */
        $scope.login = function () {
            // Sign in the user if credentials match a user from the database
            var result = $meteor.loginWithPassword($scope.user.email, $scope.user.password).then(function (result) {
                // If signed in user is not of type PR, give an error message and log them out
                if (Meteor.user().profile.type != 'pr') {
                    $translate('INCORRECT_CREDENTIALS').then(function (error) {
                        $scope.error = error;
                    });
                    $scope.errorVisible = true;
                    Meteor.logout();
                    // If PR user, log in and redirect
                } else {
                    // Redirect user if login succeeds
                    $state.go('web.members');
                }
            }, function (err) {
                // Show error message in console
                console.log(err);
                // Show generic error message to user instead of specific Meteor messages giving too much information
                if (err.error == 400 || err.error == 403) {
                    $translate('INCORRECT_CREDENTIALS').then(function (error) {
                        $scope.error = error;
                    });
                } else {
                    $scope.error = err.reason;
                }
                // Define whether error message is shown.
                $scope.errorVisible = true;
            });
        };
        // String describing the unexpected behaviour
        $scope.error = '';
        // Boolean defining whether error is visible to user
        $scope.errorVisible = false;

        /**
         * @summary Function to redirect user to forgot password page
         */
        // Open the delete modal
        $scope.forgotPass = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'client/web/views/forgotPasswordModal.ng.html',
                controller: 'ForgotPassModalInstanceCtrl',
                size: '',
                resolve: {
                    selectedUser: function () {
                        return $scope.selectedUser;
                    }
                }
            });

            // Show when modal was closed in console
            modalInstance.result.then(function (email) {
                console.log(email);
                $translate('PASSWORD_RECOVERY_SENT').then(function (error) {
                    $scope.error = error + " " + email;
                    $scope.errorVisible = true;
                });
            }, function () {
                // Modal dismissed
            });
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('addAccountCtrl', function ($scope, $meteor, $state, $translate) {
        $scope.user = {
            firstName: '',
            lastName: '',
            email: '',
            team: ''
        };

        $scope.error = '';
        $scope.errorVisible = false;
        $scope.generatePassword = function () {
            var length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        };

        $scope.addAccount = function () {
            var mailRegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (!$scope.user.firstName) {
                $translate('MISSING_FIRST_NAME').then(function (error) {
                    $scope.error = error;
                });
                $scope.errorVisible = true;
            } else if (!$scope.user.lastName) {
                $translate('MISSING_LAST_NAME').then(function (error) {
                    $scope.error = error;
                });
                $scope.errorVisible = true;
            } else if (!mailRegularExpression.test($scope.user.email)) {
                $translate('MISSING_VALID_EMAIL').then(function (error) {
                    $scope.error = error;
                });
                $scope.errorVisible = true;
            } else {
                var newUser = {
                    email: $scope.user.email,
                    password: $scope.generatePassword(),
                    profile: {
                        firstName: $scope.user.firstName,
                        lastName: $scope.user.lastName,
                        type: $scope.user.team != '' ? 'player' : 'general',
                        clubID: Meteor.user().profile.clubID,
                        teamID: $scope.user.team,
                        notifications: {}
                    }
                };


                $meteor.call('addUser', newUser).then(function (result) {
                    $state.go('web.members'); // Redirect user if registration succeeds
                }, function (err) {
                    $translate('EMAIL_IN_USE').then(function (error) {
                        $scope.error = error;
                        $scope.errorVisible = true;
                    });
                });
                }
            };
        })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('editAccountCtrl', function ($scope, $meteor, $state, $stateParams, $translate) {
        $scope.user = {
            id: $stateParams.userID,
            firstName: '',
            lastName: '',
            email: '',
            team: ''
        };

        $meteor.call('getUserInfo', $scope.user.id).then(function (result) {
            $scope.user.firstName = result.profile.firstName;
            $scope.user.lastName = result.profile.lastName;
            $scope.user.email = result.emails[0].address;
            $scope.user.team = result.profile.teamID;
            $scope.user.clubID = result.profile.clubID;

        }, function (err) {
            $translate(err.reason).then(function (error) {
                $scope.error = error;
            });
            $scope.errorVisible = true;
        });

        $scope.error = '';
        $scope.errorVisible = false;

        $scope.saveChanges = function () {
            if (!$scope.user.firstName) {
                $translate('MISSING_FIRST_NAME').then(function (error) {
                    $scope.error = error;
                });
                $scope.errorVisible = true;
            } else if (!$scope.user.lastName) {
                $translate('MISSING_LAST_NAME').then(function (error) {
                    $scope.error = error;
                });
                $scope.errorVisible = true;
            } else {
                var updatedProfile = {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    type: $scope.user.team != '' && $scope.user.team != undefined ? 'player' : 'general',
                    clubID: $scope.user.clubID,
                    teamID: $scope.user.team,
                    notifications: {
                        "Voting" : true,
                        "Heroes" : true,
                        "Form" : true
                    }
                };
                
                $meteor.call('updateUserProfile', $scope.user.id, updatedProfile).then(function (result) {
                    $state.go('web.members'); // Redirect user if registration succeeds
                }, function (err) {
                    $translate(err.reason).then(function (error) {
                        $scope.error = error;
                    });
                    $scope.errorVisible = true;
                });
            }
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('profileCtrl', function ($scope, $meteor, $state, $translate, checkPassword) {
        $scope.user = {
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        };

        $scope.retrieveUser = function () {
            $scope.user.id = Meteor.user()._id;
            $scope.user.firstName = Meteor.user().profile.firstName;
            $scope.user.lastName = Meteor.user().profile.lastName;
            $scope.user.email = Meteor.user().emails[0].address;
        };

        $scope.error = '';
        $scope.errorVisible = false;
        $scope.updatedVisible = false;

        $scope.passwordError = '';
        $scope.passwordErrorVisible = false;
        $scope.passwordUpdatedVisible = false;

        $scope.saveChanges = function () {
            if (!$scope.user.firstName) {
                $translate('MISSING_FIRST_NAME').then(function (error) {
                    $scope.error = error;
                });
                $scope.errorVisible = true;
                $scope.updatedVisible = false;
            } else if (!$scope.user.lastName) {
                $translate('MISSING_LAST_NAME').then(function (error) {
                    $scope.error = error;
                });
                $scope.errorVisible = true;
                $scope.updatedVisible = false;
            } else {
                var updatedProfile = {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    type: Meteor.user().profile.type,
                    clubID: Meteor.user().profile.clubID,
                    teamID: Meteor.user().profile.teamID,
                    notifications: {}
                };
                
                $meteor.call('updateUserProfile', $scope.user.id, updatedProfile).then(function (result) {
                    $scope.updatedVisible = true;
                    $scope.errorVisible = false;
                }, function (err) {
                    $scope.updatedVisible = false;
                    $translate(err.reason).then(function (error) {
                        $scope.error = error;
                    });
                    $scope.errorVisible = true;
                });
            }
        };

        $scope.savePasswordChanges = function () {
            if (!$scope.user.oldPassword) {
                $translate('MISSING_CURRENT_PASS').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
                $scope.passwordUpdatedVisible = false;
            } else if (!$scope.user.newPassword) {
                $translate('MISSING_NEW_PASS').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
                $scope.passwordUpdatedVisible = false;
            } else if (!$scope.user.confirmNewPassword) {
                $translate('MISSING_CONFIRM_PASS').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
                $scope.passwordUpdatedVisible = false;
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                $translate('PASS_NO_MATCH').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
                $scope.passwordUpdatedVisible = false;
            } else if (!checkPassword.checkPassword($scope.user.newPassword)) {
                $translate('PASS_NOT_VALID').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
                $scope.passwordUpdatedVisible = false;
            } else {
                $meteor.changePassword($scope.user.oldPassword, $scope.user.newPassword).then(function () {
                    $scope.passwordUpdatedVisible = true;
                    $scope.passwordErrorVisible = false;
                }, function (error) {
                    $translate('PASS_INCORRECT').then(function (error) {
                        $scope.passwordError = error;
                    });
                    $scope.passwordUpdatedVisible = false;
                    $scope.passwordErrorVisible = true;
                });
            }
        };

        if (Meteor.user() != undefined) {
            $scope.retrieveUser();
        } else {
            setTimeout(function () {
                if (Meteor.user() != undefined) {
                    $scope.retrieveUser();
                    $scope.$apply();
                }
            }, 100);
        }

    })

    .controller('ForgotPassModalInstanceCtrl', function ($scope, $modalInstance, $translate, $meteor) {

        $scope.error = '';
        $scope.errorVisible = false;

        $scope.input = {
            email: ''
        };

        $scope.send = function () {
            var mailRegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (!mailRegularExpression.test($scope.input.email)) {
                $scope.errorVisible = true;
                $translate('MISSING_VALID_EMAIL').then(function (error) {
                    $scope.error = error;
                });
            } else {
                 $meteor.call('getUserInfoByEmail', $scope.input.email).then(function (result) {
                     console.log(result);
                     if (result.profile.type == 'pr') {
                         Accounts.forgotPassword({email: $scope.input.email}, function (err) {
                            if (err) {
                                $scope.errorVisible = true;
                                $translate('MISSING_VALID_EMAIL').then(function (error) {
                                    $scope.error = error;
                                });
                                $scope.$apply();
                            } else {
                                $modalInstance.close($scope.input.email);
                            }
                        });
                     } else {
                        $scope.errorVisible = true;
                        $translate('MISSING_VALID_EMAIL').then(function (error) {
                            $scope.error = error;
                        });
                        $scope.$apply();                         
                     }
                }, function (err) {
                    console.log(err);
                    
                    $scope.errorVisible = true;
                    $translate('MISSING_VALID_EMAIL').then(function (error) {
                        $scope.error = error;
                    });
                    $scope.$apply();
                });                
            }
        }
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })

    .controller('enrollCtrl', function ($scope, $meteor, $state, $stateParams, checkPassword, $translate) {
        $scope.token = $stateParams.token;

        $scope.user = {
            newPassword: '',
            confirmNewPassword: ''
        }

        $scope.passwordError = '';
        $scope.passwordErrorVisible = false;

        $scope.setPassword = function () {
            if (!$scope.user.newPassword) {
                $translate('MISSING_NEW_PASS').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
            } else if (!$scope.user.confirmNewPassword) {
                $translate('MISSING_CONFIRM_PASS').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                $translate('PASS_NO_MATCH').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
            } else if (!checkPassword.checkPassword($scope.user.newPassword)) {
                $translate('PASS_NOT_VALID').then(function (error) {
                    $scope.passwordError = error;
                });
                $scope.passwordErrorVisible = true;
                $scope.passwordUpdatedVisible = false;
            } else {
                $meteor.resetPassword($scope.token, $scope.user.newPassword).then(function (result) {
                    $scope.passwordErrorVisible = false;
                    if (Meteor.user().profile.type == 'pr') {
                        $state.go('web.members');
                    } else {
                        Meteor.logout();
                        $state.go('login');
                    }
                }, function (err) {
                    $translate(err.reason).then(function (error) {
                        $scope.passwordError = error;
                    });
                    $scope.passwordErrorVisible = true;
                    $scope.passwordUpdatedVisible = false;
                });
            }
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('DeleteModalInstanceCtrl', function ($scope, $modalInstance, selectedUser) {
        $scope.selectedUser = selectedUser;

        $scope.delete = function () {
            $modalInstance.close($scope.selectedUser);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })