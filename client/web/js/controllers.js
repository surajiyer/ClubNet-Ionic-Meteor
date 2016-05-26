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
            email: ''
        };
        
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
            Meteor.call('addUser', newUser, function (err) {
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

    .controller('accountManagementCtrl', function ($scope, $modal) {

        $scope.subscribe('userData');

        $scope.helpers({
            userAccounts: function () {
                return Meteor.users.find();
            }
        });

        $scope.deleteAccount = function(user) {
            Meteor.users.remove(user._id);
        };

        // Open the modal
        $scope.open = function (user) {
            $scope.selectedUser = user
            console.log(user);
            console.log($scope.selectedUser);
            var modalInstance = $modal.open({
                animation: true,
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
            console.log($scope.selectedUser);
            $modalInstance.close($scope.selectedUser);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    });