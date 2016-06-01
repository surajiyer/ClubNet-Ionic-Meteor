angular.module('web.controllers', ['ui.bootstrap'])

    /**
     *  Main Controller: overarching web interface functionality.
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('mainCtrl', function ($scope, $meteor, $state) {
        /**
         * @summary This function logs out the user and redirects it to the login page.
         */
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login');
        };
        $scope.hostname = 'http://' + window.location.hostname + ':3000';

        /**
         * @summary Function for retrieving the club a user is logged into.
         * @param
         */
        $meteor.call('getClub').then(function(result){
            $scope.currentClub = result;
        }, function(err){
            console.log(err);
        });
       
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('loginCtrl', function ($scope, $meteor, $state, $modal) {

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
            result = $meteor.loginWithPassword($scope.user.email, $scope.user.password).then(function(result){
                // If signed in user is not of type PR, give an error message and log them out
                if (Meteor.user().profile.type != 'pr') {
                    $scope.error = 'Incorrect credentials';
                    $scope.errorVisible = true;
                    Meteor.logout();
                 // If PR user, log in and redirect
                } else {
                    // Redirect user if login succeeds
                    $state.go('web.feed');
                }
            }, function(err){
                // Show error message in console
                console.log(err);
                // Show generic error message to user instead of specific Meteor messages giving too much information
                if (err.error == 400 || err.error == 403) {
                    $scope.error = 'Incorrect credentials'
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

            }, function () {
                // Modal dismissed
            });
        };
    })

    /**
     *  Settings: provides the functionality for the settings page of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('settingsCtrl', function ($scope, $meteor, $timeout) {



        /**
         * @summary Function for retrieving the image URL for the club logo, which is in the database
         */
        $meteor.call('getImage').then(function(result){
            //console.log(result);
        }, function(err){
            console.log(err);
        });

        $meteor.subscribe('images');
        $meteor.subscribe('clubs');

        $scope.hostname = 'http://' + window.location.hostname + ':3000';

        /**
         * @summary Function for uploading a file.
         * @method uploadFile
         * @param {Object} event The file to upload.
         * @after All the images are uploaded to the server.
         */
        $scope.uploadFile = function (event) {
            var files = event.target.files;

            for (var i = 0, ln = files.length; i < ln; i++) {

                files[i].userId = Meteor.userId();
                // Insert all the images into the Images collection.
                Images.insert(files[i], function (err, fileObj) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(fileObj.url({brokenIsFine: true}));
                        $scope.currentClub.logo = fileObj.url({brokenIsFine: true});
                    }
                });
            }
        };

        $scope.saved = false;
        /**
         * @summary Function for saving the new settings for the club.
         * @method save
         * @after The new settings are saved on the server.
         */
        $scope.save = function(){

            $scope.saved = true;
            $timeout(function(){$scope.saved = false;}, 1500);
            $meteor.call('updateClub', $scope.currentClub).then(function(result){
                $scope.currentClub = result;
            }, function(err){
                console.log(err);
            });

        };

        /**
         * @summary Helper functions
         * @method save
         * @param {Function} club Returns all the clubs
         * @param {Function} images Returns the images
         */
        $scope.helpers({
            club: function () {
                return Clubs.find({});
            },
            images: function () {
                return Images.find({});
            }
        });
    })

    /**
     *  Custom on change Controller: puts a listener on file input change
     *  @param {String} Name of the directive
     *  @param {Function}
     */
    .directive('customOnChange', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('addAccountCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            firstName: '',
            lastName: '',
            email: '',
            team: ''
        };
        
        $scope.error = '';
        $scope.errorVisible = false;        
        $scope.generatePassword = function() {
            var length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        }
        
        $scope.addAccount = function () {
            var mailRegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            
            if (!$scope.user.firstName) {
                    $scope.error = 'No first name specified';
                    $scope.errorVisible = true;                
            } else if (!$scope.user.lastName) {
                    $scope.error = 'No last name specified';
                    $scope.errorVisible = true;                
            } else if (!mailRegularExpression.test($scope.user.email)) {
                    $scope.error = 'No valid email specified';
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
                        teamID: $scope.user.team
                    }
                };

                $meteor.call('addUser', newUser).then(function(result){
                    $state.go('web.members'); // Redirect user if registration succeeds
                }, function(err){
                    console.log('error');
                    console.log(err);
                    $scope.error = err.reason;
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
    .controller('editAccountCtrl', function ($scope, $meteor, $state, $stateParams) {
        $scope.user = {
            id: $stateParams.userID,
            firstName: '',
            lastName: '',
            email: '',
            team: ''
        };
        
        $meteor.call('getUserInfo', $scope.user.id).then(function(result){
            $scope.user.firstName = result.profile.firstName;
            $scope.user.lastName = result.profile.lastName;
            $scope.user.email = result.emails[0].address;
            $scope.user.team = result.profile.teamID;
            $scope.user.clubID = result.profile.clubID;

        }, function(err){
            console.log('error');
            console.log(err);
            $scope.error = err.reason;
            $scope.errorVisible = true;
        });
        
        $scope.error = '';
        $scope.errorVisible = false;        
        
        $scope.saveChanges = function () {
            if (!$scope.user.firstName) {
                    $scope.error = 'No first name specified';
                    $scope.errorVisible = true;                
            } else if (!$scope.user.lastName) {
                    $scope.error = 'No last name specified';
                    $scope.errorVisible = true;                
            } else {
                 var updatedProfile = {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    type: $scope.user.team != '' ? 'player' : 'general',
                    clubID: $scope.user.clubID,
                    teamID: $scope.user.team
                };
                
                $meteor.call('updateUserProfile', $scope.user.id, updatedProfile).then(function(result){
                    $state.go('web.members'); // Redirect user if registration succeeds
                }, function(err){
                    console.log('error');
                    console.log(err);
                    $scope.error = err.reason;
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
    .controller('profileCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        }
        
        $scope.retrieveUser = function() {
            $scope.user.id = Meteor.user()._id;
            $scope.user.firstName = Meteor.user().profile.firstName;
            $scope.user.lastName = Meteor.user().profile.lastName;
            $scope.user.email = Meteor.user().emails[0].address;    
        }
        
        $scope.error = '';
        $scope.errorVisible = false;    
        $scope.updatedVisible = false; 
        
        $scope.passwordError = '';
        $scope.passwordErrorVisible = false;    
        $scope.passwordUpdatedVisible = false;   
        
        $scope.saveChanges = function () {
            if (!$scope.user.firstName) {
                    $scope.error = 'No first name specified';
                    $scope.errorVisible = true;   
                    $scope.updatedVisible = false;             
            } else if (!$scope.user.lastName) {
                    $scope.error = 'No last name specified';
                    $scope.errorVisible = true;  
                    $scope.updatedVisible = false;              
            } else {
                 var updatedProfile = {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    type: 'pr',
                    clubID: "PSV",
                    teamID: ''
                };
                
                $meteor.call('updateUserProfile', $scope.user.id, updatedProfile).then(function(result){
                    $scope.updatedVisible = true;
                    $scope.errorVisible = false;
                }, function(err){
                    $scope.updatedVisible = false;
                    $scope.error = err.reason;
                    $scope.errorVisible = true;
                });
            }
        };
        
        $scope.savePasswordChanges = function () {
            if (!$scope.user.oldPassword) {
                $scope.passwordError = 'Old password not filled in';
                $scope.passwordErrorVisible = true;     
                $scope.passwordUpdatedVisible = false;           
            } else if (!$scope.user.newPassword) {
                $scope.passwordError = 'No new password specified';
                $scope.passwordErrorVisible = true;          
                $scope.passwordUpdatedVisible = false;            
            } else if (!$scope.user.confirmNewPassword) {
                $scope.passwordError = 'Please confirm your new password';
                $scope.passwordErrorVisible = true;        
                $scope.passwordUpdatedVisible = false;              
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                $scope.passwordError = 'New passwords are do not match';
                $scope.passwordErrorVisible = true;     
                $scope.passwordUpdatedVisible = false; 
            } else {
                $meteor.changePassword($scope.user.oldPassword, $scope.user.newPassword).then(function () {
                    $scope.passwordUpdatedVisible = true;
                    $scope.passwordErrorVisible = false;
                }, function (error) {
                    $scope.passwordUpdatedVisible = false;
                    $scope.passwordError = error.reason;
                    $scope.passwordErrorVisible = true;
                });
            }
        };
        
        if (Meteor.user() != undefined) {
            $scope.retrieveUser();
        } else {
            setTimeout(function() {
                if (Meteor.user() != undefined) {
                    $scope.retrieveUser();
                    $scope.$apply();
                }
            }, 100);
        }
        
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('accountManagementCtrl', function ($scope, $modal, $state) {

        $scope.subscribe('userData');

        $scope.helpers({
            userAccounts: function () {
                return Meteor.users.find({}, {sort: [['profile.lastName', 'asc']]});
            }
        });

        $scope.deleteAccount = function(user) {
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
            $state.go('web.editAccount', {'userID' : user._id});
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

    .controller('ForgotPassModalInstanceCtrl', function ($scope, $modalInstance) {

        $scope.error = '';
        $scope.errorVisible = false;

        $scope.input = {
            email: ''
        };

        $scope.send = function () {
            var mailRegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (!mailRegularExpression.test($scope.input.email)) {
                $scope.errorVisible = true;
                $scope.error = 'No valid email specified';
            } else {
                Accounts.forgotPassword({email: $scope.input.email}, function(err) {
                    if (err) {
                        $scope.errorVisible = true;
                        $scope.error = 'No valid email specified';
                        $scope.$apply();
                    } else {
                        $modalInstance.close();
                    }
                });
            }
        }
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('resetPasswordCtrl', function ($scope, $meteor, $state) {
        console.log('reset password controller');
    })
    
    .controller('enrollCtrl', function ($scope, $meteor, $state, $stateParams) {
        $scope.token = $stateParams.token;
        
         $scope.user = {
            newPassword: '',
            confirmNewPassword: ''
        }
        
        $scope.passwordError = '';
        $scope.passwordErrorVisible = false;
        
        $scope.setPassword = function () {
            if (!$scope.user.newPassword) {
                $scope.passwordError = 'No new password specified';
                $scope.passwordErrorVisible = true;                
            } else if (!$scope.user.confirmNewPassword) {
                $scope.passwordError = 'Please confirm your new password';
                $scope.passwordErrorVisible = true;                  
            } else if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
                $scope.passwordError = 'New passwords are do not match';
                $scope.passwordErrorVisible = true;     
            } else {
                $meteor.resetPassword($scope.token, $scope.user.newPassword).then(function () {
                    $scope.passwordErrorVisible = false;


                    /**
                     *
                     * @type {{firstName: *, lastName: *, type: string, clubID: string, teamID: string}}
                     */
                    var updatedProfile = {
                        firstName: Meteor.user().profile.firstName,
                        lastName: Meteor.user().profile.lastName,
                        type: 'pr',
                        clubID: Meteor.user().profile.clubID,
                        teamID: ''
                    };
                    $meteor.call('updateUserProfile', Meteor.userId(), updatedProfile).then(function(result){
                    }, function(err){
                        console.log('Profile not updated to pr');
                        console.log(err);
                    });
                    
                    $state.go('/');
                }, function (error) {
                    $scope.passwordError = error.reason;
                    $scope.passwordErrorVisible = true;
                });
            }
        };
    });