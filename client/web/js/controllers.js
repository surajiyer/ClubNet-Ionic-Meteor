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
            email: '',
            team: ''
        };
        
        $scope.error = '';
        $scope.errorVisible = false;        
        
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
                    password: "dev",
                    profile: {
                        firstName: $scope.user.firstName,
                        lastName: $scope.user.lastName,
                        type: 'general',
                        clubID: "PSV"
                    }
                };
                
                Meteor.call('addUser', newUser, function (result,err) {
                    if (err) {
                        $scope.error = err.reason;
                        $scope.errorVisible = true;
                    } else {
                        $state.go('web.members'); // Redirect user if registration succeeds
                    }
                });
            }
        };
    })


    ///***************************accountMangementCtrl**************************************//

    .controller('accountManagementCtrl', function ($scope, $modal) {

        $scope.subscribe('userData');

        $scope.helpers({
            userAccounts: function () {
                return Meteor.users.find({}, {sort: [['profile.lastName', 'asc']]});
            }
        });

        $scope.deleteAccount = function(user) {
            Meteor.users.remove(user._id);
        };

        // Open the modal
        $scope.open = function (user) {
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
    })

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, selectedUser) {
        
        $scope.selectedUser = selectedUser;
        
        $scope.ok = function () {
            $modalInstance.close($scope.selectedUser);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    });