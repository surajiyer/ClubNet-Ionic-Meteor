angular.module('formControllers', [])

/**
 *  Form Controller: provides all functionality for the form feed item of the app
 *  @param {String} Name of the controller
 *  @param {Function}
 */
    .controller('formCtrl', function ($scope, $ionicModal, $meteor, $ionicPopup, $translate) {

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
         * @summary Function to show the 'select target value alert'
         */
        $scope.showAlert = function () {
            $translate('MISSING_TARGET_VALUE').then(function (result) {
                $ionicPopup.alert({
                    title: result
                });
            });
        };

        /**
         * @summary (Re)loads various session variables
         * @method reloadResponses
         * @after The session variables are updated. (raisedValue, myContribution, hasContribution)
         */
        $scope.reloadResponses = function () {
            // Check if user has contributed to this item when initialising
            if ($scope.item != null) {

                // Check responses from other users
                // Meteor.call('getRaisedValue', $scope.item._id, function (err, result) {
                //     if (err) {
                //         throw new Meteor.Error(err.reason);
                //     }
                //     calculatedRaisedValue = result;
                //
                //     // There should be a check here that determines whether the raisedValue from
                //     // the database is the same as the one that is calculated from all responses.
                //     // for convenience we are only using the directRaisedValue (from the database directly)
                //     // For this we have to assume that this will be consistent with the response items at all times.
                //     // A possible more robust implementation would be to use both the calculatedRaisedValue and the directRaisedValue
                //     // these 2 variables can then be compared and thus should be equal to each other
                // });

                // Check user response
                Meteor.call('getResponse', $scope.item._id, function (err, result) {
                    if (err) {
                        throw new Meteor.Error(err.reason);
                    }
                    // If there exists a response, get the response.
                    $scope.item.myContribution = !!result ? result.value : 0;
                    // Refresh the scope to update on UI
                    $scope.$apply();
                });
            }
            // convenient logging that can be used to directly see the performance of this reload functionality
            // which is invoked by observeChange when the increaseValue was incremented for the corresponding item.
            console.log("reloaded");
        };

        $scope.reloadResponses();

        /**
         * @summary Handles the response of a user to the form
         * @method signUp
         * @param {String} Value of the user's contribution field
         * @after A new entry is made in the FeedResponses collection. The local value hasContributed is set to the function's parameter
         */
        $scope.signUp = function () {
            if ($scope.item.myContribution <= 0) {
                if ($scope.item.target == 'driving' || $scope.item.target == 'other') {

                }
                if ($scope.item.target == 'laundry' || $scope.item.target == 'absence') {
                    var value = '1';
                }
            }

            $meteor.call('putResponse', $scope.item._id, $scope.item.type, value).then(
                function () {
                    $scope.item.hasContributed = true;
                    //Increase the raisedValue of item with value=x
                    $meteor.call('increaseValue', $scope.item._id, $scope.item.type, value).then(
                        function () {
                        }, function () {
                        }
                    );
                },
                function (err) {
                    console.log(err);
                }
            );
        };

        /**
         * @summary Function to withdraw contribution
         * @method withdrawContribution
         * @after The to the item's and user's corresponding FeedResponse collection is deleted. hasContributed and myContribution are reset to its initial value.
         */
        $scope.withdrawContribution = function () {
            $meteor.call('deleteResponse', $scope.item._id).then(
                function () {
                    $scope.item.hasContributed = false;
                    $scope.item.myContribution = 0;
                },
                function (err) {
                    console.log(err);
                }
            );
            //Decrease the raisedValue of item with value=x
            $meteor.call('decreaseValue', $scope.item._id, $scope.item.type, $scope.item.myContribution).then(
                function (result) {
                },
                function (err) {
                }
            );
        };


        /**
         * @summary Meteor function that invokes the reloadResponse when a change in the item's collection is observered
         * @method observeChanges
         * @after reloadResponse is fired, see reloadResponse function
         */
        Items.find({_id: $scope.item._id}).observeChanges({
            changed: $scope.reloadResponses
        });

        $scope.$on("loadEditData", function () {
            $scope.$parent.newItem.target = $scope.item.target;
            $scope.$parent.newItem.repeatInterval = $scope.item.repeatInterval;
            $scope.$parent.newItem.description = $scope.item.description;
            $scope.$parent.newItem.targetValue = $scope.item.targetValue;
        });

        $scope.$on("successEdit", function (e, res) {
            console.log(res);
        });
    })