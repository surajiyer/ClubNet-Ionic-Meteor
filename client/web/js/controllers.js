angular.module('web.controllers', ['ui.bootstrap'])
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
            result = $meteor.loginWithPassword($scope.user.email, $scope.user.password).then(function(result){
                if (Meteor.user().profile.type != 'pr') {
                    $scope.user.email = '';
                    $scope.user.password = '';
                    $scope.error = 'Only PR users can enter';
                    $scope.errorVisible = true;
                    Meteor.logout();
                } else {
                    // Redirect user if login succeeds
                    $state.go('web.feed');
                }
            }, function(err){
                console.log('error');
                console.log(err);
                $scope.error = err.reason;
                $scope.errorVisible = true;
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

    .directive('customOnChange', function() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    })

    .controller('settingsCtrl', function ($scope, $meteor, $timeout) {

        $meteor.call('getClub').then(function(result){
            $scope.currentClub = result;
        }, function(err){
            console.log(err);
        });

        $meteor.call('getImage').then(function(result){
            //console.log(result);
        }, function(err){
            console.log(err);
        });

        $meteor.subscribe('images');

        $scope.uploadFile = function (event) {
            var files = event.target.files;

            for (var i = 0, ln = files.length; i < ln; i++) {

                files[i].userId = Meteor.userId();
                Images.insert(files[i], function (err, fileObj) {
                    if (err) {
                       // console.log(err);
                    } else {
                        $meteor.call('updateClub', {logo: fileObj.url({brokenIsFine: true})}).then(function(result){}, function(err){
                            console.log(err);
                        });
                    }
                });
            }
        }
        $scope.saved = false;
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

        }

        $scope.helpers({
            club: function () {
                return Clubs.find({});
            },
            images: function () {
                return Images.find({});
            }
        });
    })

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
                        clubID: "PSV",
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
                    clubID: "PSV",
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

    .controller('profileCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            id: Meteor.user()._id,
            firstName: Meteor.user().profile.firstName,
            lastName: Meteor.user().profile.lastName,
            email: Meteor.user().emails[0].address
        };
        
        $scope.error = '';
        $scope.errorVisible = false;    
        $scope.updatedVisible = false;    
        
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
                    type: 'pr',
                    clubID: "PSV",
                    teamID: ''
                };
                
                $meteor.call('updateUserProfile', $scope.user.id, updatedProfile).then(function(result){
                    $scope.updatedVisible = true;
                    $scope.errorVisible = false;
                }, function(err){
                    $scope.updatedVisible = false;
                    console.log('error');
                    console.log(err);
                    $scope.error = err.reason;
                    $scope.errorVisible = true;
                });
            }
        };
    })

    ///***************************accountMangementCtrl**************************************//

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

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, selectedUser) {
        
        $scope.selectedUser = selectedUser;
        
        $scope.ok = function () {
            $modalInstance.close($scope.selectedUser);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    })
    
    .controller('resetPasswordCtrl', function ($scope, $meteor, $state) {
        console.log('reset password controller');
    });