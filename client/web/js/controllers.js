angular.module('web.controllers', ['ui.bootstrap'])

    /**
     *  Main Controller
     *  @summary Overarching web interface functionality. Logging out.
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
        }
    })

    /**
     *  Login Controller
     *  @summary Provides all functionality for the login screen of the web interface.
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('loginCtrl', function ($scope, $meteor, $state) {

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
        $scope.goToRemindPassword = function() {
            $state.go('forgotPassword');
        }
    })

    /**
     *  Settings
     *  @summary Provides the functionality for the settings page of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('settingsCtrl', function ($scope, $meteor, $timeout) {

        /**
         * @summary Function for retrieving the club name that a logged in user is associated with.
         */
        $meteor.call('getClub').then(function(result){
            $scope.currentClub = result;
        }, function(err){
            console.log(err);
        });

        /**
         * @summary Function for retrieving the image URL for the club logo, which is in the database
         */
        $meteor.call('getImage').then(function(result){
            //console.log(result);
        }, function(err){
            console.log(err);
        });

        $meteor.subscribe('images');

        $scope.hostname = 'http://' + window.location.hostname;

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
                       // console.log(err);
                    } else {
                        //Good is normal
                        $meteor.call('updateClub', {logo: fileObj.url({brokenIsFine: true})}).then(function(result){}, function(err){
                            console.log(err);
                        });
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
            var updatedClub = {
                name: $scope.currentClub.name,
                colorPrimary: $scope.currentClub.colorPrimary,
                colorSecondary: $scope.currentClub.colorSecondary,
                colorAccent: $scope.currentClub.colorAccent,
                heroesMax: $scope.currentClub.heroesMax
            };
            $scope.saved = true;
            $timeout(function(){$scope.saved = false;}, 1500);
            $meteor.call('updateClub', updatedClub).then(function(result){}, function(err){
                console.log(err);
            });

        };

        console.log(Clubs.find({}).fetch());
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
     *  Add Account Controller
     *  @summary Provides all functionality for the login screen of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('addAccountCtrl', function ($scope, $meteor, $state) {

        // Credentials filled in on the add account page
        $scope.user = {
            firstName: '',
            lastName: '',
            email: '',
            team: ''
        };

        // Sring for error message
        $scope.error = '';

        // Boolean defines whether error message is visible to users
        $scope.errorVisible = false;

        /**
         *  @summary Function to generate a random password for newly created users
         *  @returns retVal The password that is assigned to a user after creation
         */
        $scope.generatePassword = function() {
            var length = 8,
                charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                retVal = "";
            for (var i = 0, n = charset.length; i < length; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        }

        /**
         *  @summary Function to add accounts to the database
         *  First, this function checks whether all fields have been filled in correctly and with valid information.
         *  If valid information, the account is added to the database.
         */
        $scope.addAccount = function () {

            // Regular expression to check whether filled in e-mail is valid
            var mailRegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            // Check whether all filled in information is valid.
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
                        clubID: "PSV",
                        teamID: $scope.user.team
                    }
                };

                // Add the user to the database with this Meteor call
                $meteor.call('addUser', newUser).then(function(result){
                    $state.go('web.members'); // Redirect user if registration succeeds
                    // Show error if unexpected things happen
                }, function(err){
                    console.log('error');
                    console.log(err);
                    $scope.error = err.reason;
                    // Define whether error is shown to user
                    $scope.errorVisible = true;
                });
            }
        };
    })

    /**
     *  Edit Account Controller
     *  @summary Functionality for editing a user from the web interface
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

        // Retrieve user information from the database
        $meteor.call('getUserInfo', $scope.user.id).then(function(result){
            $scope.user.firstName = result.profile.firstName;
            $scope.user.lastName = result.profile.lastName;
            $scope.user.email = result.emails[0].address;
            $scope.user.team = result.profile.teamID;
        }, function(err){
            console.log('error');
            console.log(err);
            $scope.error = err.reason;
            $scope.errorVisible = true;
        });

        // Error message String
        $scope.error = '';
        $scope.errorVisible = false;

        /**
         *  @summary Function for saving the new user changes to the database
         */
        $scope.saveChanges = function () {
            // Check to see whether first name has been entered
            if (!$scope.user.firstName) {
                    $scope.error = 'No first name specified';
                    $scope.errorVisible = true;
            // Check to see whether last name has been entered
            } else if (!$scope.user.lastName) {
                    $scope.error = 'No last name specified';
                    $scope.errorVisible = true;
            // Changed updateProfile object to new values
            } else {
                 var updatedProfile = {
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    type: $scope.user.team != '' ? 'player' : 'general',
                    clubID: "PSV",
                    teamID: $scope.user.team
                };

                // Update the account in the database
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
     *  Profile Controller
     *  @summary Provides all functionality for the profile page of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('profileCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            id: '',
            firstName: '',
            lastName: '',
            email: ''
        }

        // Retrieve user information from the database
        $scope.retrieveUser = function() {
            $scope.user.id = Meteor.user()._id;
            $scope.user.firstName = Meteor.user().profile.firstName;
            $scope.user.lastName = Meteor.user().profile.lastName;
            $scope.user.email = Meteor.user().emails[0].address;    
        }

        // Error messages
        $scope.error = '';
        $scope.errorVisible = false;    
        $scope.updatedVisible = false;    

        // Save updated user profile to the database
        $scope.saveChanges = function () {
            // Validation of filled in information
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
                    type: 'pr',
                    clubID: "PSV",
                    teamID: ''
                };

                // Do the actual saving on the database
                $meteor.call('updateUserProfile', $scope.user.id, updatedProfile).then(function(result){
                    $scope.updatedVisible = true;
                    $scope.errorVisible = false;
                    // Generate error if needed
                }, function(err){
                    $scope.updatedVisible = false;
                    console.log('error');
                    console.log(err);
                    $scope.error = err.reason;
                    $scope.errorVisible = true;
                });
            }
        };

        // Time out 100ms because of Meteor bug where user is undefined when routing to this page
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
     *  Account Management Controller
     *  @summary Provides all functionality for the members page of the web interface.
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('accountManagementCtrl', function ($scope, $modal, $state) {

        // Subscription to userData so that all users can be displayed
        $scope.subscribe('userData');

        // Sort list on last name
        $scope.helpers({
            userAccounts: function () {
                return Meteor.users.find({}, {sort: [['profile.lastName', 'asc']]});
            }
        });

        // Delete account if it is not of type pr
        $scope.deleteAccount = function(user) {
            if (user.type !== 'pr') {
                Meteor.users.remove(user._id);
            }
        };

        // Open the delete modal
        $scope.delete = function (user) {
            $scope.selectedUser = user
            var modalInstance = $modal.open({
                animation: false,
                templateUrl: 'client/web/views/deleteAccountModal.ng.html',
                controller: 'ModalInstanceCtrl',
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
     *  Modal Controller
     *  @summary Provides all functionality for the delete modal
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, selectedUser) {
        
        $scope.selectedUser = selectedUser;
        
        $scope.ok = function () {
            $modalInstance.close($scope.selectedUser);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })

    /**
     *  Reset password
     *  @summary Provides functionality for the password reset screen
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('resetPasswordCtrl', function ($scope, $meteor, $state) {
        console.log('reset password controller');
    });