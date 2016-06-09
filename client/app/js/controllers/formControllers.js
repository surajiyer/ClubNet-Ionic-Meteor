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


        $scope.reloadResponses = function () {
                // Check if user has contributed to this item when initialising
                if ($scope.item != null) {

                    var calculatedRaisedValue = "";
                    

                      //Did someone add all repond?
                    Meteor.call('getRaisedValue', $scope.item._id, function (err, result) {
                        if (err) throw new Meteor.Error(err.reason);
                        calculatedRaisedValue = result;

                            Meteor.call('getFeedItem', $scope.item._id, function (err, result) {
                                if (err) throw new Meteor.Error(err.reason);
                                directRaisedValue = result.raisedValue;

                                console.log("calculatedRaisedValue: "+calculatedRaisedValue);
                                console.log("directRaisedValue: "+directRaisedValue);

                                    // there should be a check here that determines wheter the raisedValue from 
                                    // the database is the same as the one that is calculated from all respones.
                                    // for convinience we are only using the directRaisedValue (from the database directly)
                                    // For this we have to assume that this will be consistent with the response items at all times.
                                    $scope.item.raisedValue = directRaisedValue;
                                    $scope.$apply();
                            });

                    });
                    //Did the user respond?
                    Meteor.call('getResponse', $scope.item._id, function (err, result) {
                        if (err) throw new Meteor.Error(err.reason);
                        if (!result)
                        {
                          $scope.item.myContribution = 0
                          $scope.item.hasContributed = false;
                        }
                        console.log("RESULT IN GET RESPONSE: "+result);
                        if(result != null){
                          $scope.item.myContribution = result.value;
                          $scope.item.hasContributed = true;
                        }
                        $scope.$apply();
                                console.log("myContribution: "+$scope.item.myContribution);
                                console.log("hasContributed: "+$scope.item.hasContributed);
                    });
                }
                console.log("reloaded");
            }

        $scope.reloadResponses();

        /**
         * @summary Function to sign up
         */
        $scope.signUp = function (value) {
            if (!value) return;
            $meteor.call('putResponse', $scope.item._id, $scope.item.type, value).then(
                function(result){
                    $scope.item.hasContributed = value;
                },
                function (err) {
                    console.log(err);
                }
            ),

            //Increase the raisedValue of item with value=x
            $meteor.call('increaseValue', $scope.item._id, $scope.item.type, value).then(
                function(result){

                },
                function (err) {

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
                    $scope.item.myContribution = 0;
                },
                function (err) {
                    console.log(err);
                }

            ),
            //Decrease the raisedValue of item with value=x
            $meteor.call('decreaseValue', $scope.item._id, $scope.item.type, $scope.item.myContribution).then(
                function(result){

                },
                function (err) {

                }
            );
        }

        // Tracker.autorun(function(){
        //     console.log($scope.item);
        //     var raisedValue = Items.find($scope.item._id).fetch()[0].raisedValue;
        //     if(!raisedValue) return;
        //     console.log("updated");
        //     $scope.reloadResponses();
        // })

        Items.find().observeChanges({
           changed: function (raisedValue) {
               $scope.reloadResponses();
           },
        });
    })