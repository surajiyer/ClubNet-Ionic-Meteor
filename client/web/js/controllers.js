angular.module('web.controllers', [])
    .controller('mainController', function($scope) {
      $scope.isTrue = false;
    })

    .controller('loginController', function ($scope, $meteor, $state) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.login = function () {
            $meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    console.log(error.reason); // Output error if login fails
                } else {
                    $state.go('menu.feed'); // Redirect user if login succeeds
                }
            });
        };

        $scope.goToRemindPassword = function() {
            $state.go('forgotPassword');
        }
    })
