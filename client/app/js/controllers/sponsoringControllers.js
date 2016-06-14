angular.module('sponsoringControllers', [])

    /**
     *  Hero Controller: provides all functionality for the heroes feed item of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('sponsoringCtrl', function ($scope, $meteor, $ionicModal) {

        $ionicModal.fromTemplateUrl('client/app/views/feedItems/newSponsoring.ng.html', {
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
            $scope.$parent.newItem.description = $scope.item.description;
            $scope.$parent.newItem.deadline = $scope.item.deadline;
            $scope.$parent.newItem.targetValue = $scope.item.targetValue;
        });

        $scope.$on("successEdit", function (e, res) {
            console.log(res);
        });
        
    })