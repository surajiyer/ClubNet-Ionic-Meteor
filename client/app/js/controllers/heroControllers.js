angular.module('heroControllers', [])

    /**
     *  Hero Controller: provides all functionality for the heroes feed item of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('heroCtrl', function ($scope, $ionicModal) {
        $ionicModal.fromTemplateUrl('client/app/views/feedItems/newHeroes.ng.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        /**
         * Function to close the hero modal
         */
        $scope.closeHero = function () {
            $scope.modal.hide();
        };

        /**
         * Function to close the hero modal
         */
        $scope.openHero = function () {
            $scope.modal.show();
        };

        $scope.$on("loadEditData", function () {
            $scope.$parent.newItem.image = $scope.item.image;
            $scope.$parent.newItem.description = $scope.item.description;
        });
    })