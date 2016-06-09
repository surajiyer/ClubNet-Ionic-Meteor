angular.module('heroControllers', [])

    /**
     *  Hero Controller: provides all functionality for the heroes feed item of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('heroCtrl', function ($scope, $meteor, $ionicModal) {

        $ionicModal.fromTemplateUrl('client/app/views/feedItems/newHeroes.ng.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.closeHero = function () {
            $scope.modal.hide();
        };

        $scope.openHero = function () {
            $scope.modal.show();
        };

        $scope.$on("loadEditData", function () {
            $scope.$parent.newItem.image = $scope.item.image;
        });

        $scope.$on("successEdit", function (e, res) {
            console.log(res);
        });
        
    })