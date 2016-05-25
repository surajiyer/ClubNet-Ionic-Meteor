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

    .controller('accountManagementCtrl', function ($scope, $modal, $log, $meteor, $state) {

        $scope.subscribe('userData');

        $scope.helpers({
            userAccounts: function () {
                return Meteor.users.find();
            }
        });

        $scope.deleteAccount = function(user) {
            Meteor.users.remove(user._id);
        };

        $scope.items = ['item1', 'item2', 'item3'];

        $scope.animationsEnabled = true;

        $scope.open = function (size) {

            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'client/web/views/deleteAccountModal.ng.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };
    })

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            deleteAccount(user);
        };
    });