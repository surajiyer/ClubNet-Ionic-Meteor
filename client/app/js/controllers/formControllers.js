angular.module('formControllers', [])

    /**
     *  Form Controller: provides all functionality for the form feed item of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('formCtrl', function ($scope, $ionicModal, $meteor, $ionicPopup) {
        /* Practicality*/
        $scope.newForm = {};

        $scope.form = function () {
            $scope.newForm.type = 'Form';
            $scope.newForm.published = true;
            $scope.newForm.createdAt = new Date;
            $scope.newForm.locked = false;
            $scope.newForm.teamID = Meteor.user().profile.teamID;
            Meteor.call('addFeedItem', $scope.newForm);
            $scope.newForm = {};
            $scope.closeForm();
        };

        /**
         * @summary Load the new form template
         */
        $ionicModal.fromTemplateUrl('client/app/views/feedItems/newForm.ng.html', {
            scope: $scope
        }).then(function (formModal) {
            $scope.formModal = formModal;
        });

        /**
         * @summary Function to close the form modal
         */
        $scope.closeForm = function () {
            $scope.formModal.hide();
        };

        /**
         * @summary Function to show the form modal
         */
        $scope.openForm = function () {
            $scope.formModal.show();
        };

        /**
         * @summary Function to show the select target value alert
         */
        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Please select target value'
            });
        };

        // Check if user has contributed to this item when initialising
        if ($scope.item != null) {
            Meteor.call("getItemType", $scope.item.type, function (err, result) {
                if (err) throw new Meteor.Error(err.reason);
                if (!result) return;
                $scope.itemType = result;
                $scope.$apply();
            });

            $scope.item.hasContributed = false;
            Meteor.call('getResponse', $scope.item._id, function (err, result) {
                if (err) throw new Meteor.Error(err.reason);
                if (!result) return;
                $scope.item.hasContributed = result;
                $scope.$apply();
            });
        }

        /**
         * @summary Function to sign up
         */
        $scope.signUp = function (value) {
            if (!value) return;
            $meteor.call('putResponse', $scope.item._id, $scope.item.type, value).then(
                function (result) {
                    $scope.item.hasContributed = value;
                },
                function (err) {
                    console.log(err);
                }
            );
        };

        /**
         * @summary Function to withdraw contribution
         */
        $scope.withdrawContribution = function () {
            $meteor.call('deleteResponse', $scope.item._id).then(
                function (result) {
                    $scope.item.hasContributed = false;
                },
                function (err) {
                    console.log(err);
                }
            );
        }
    })