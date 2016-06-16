angular.module('votingControllers', [])

/**
 *  Voting Controller: provides all functionality for the voting feed item of the app
 *  @param {String} Name of the controller
 *  @param {Function}
 */
    .controller('votingCtrl', function ($scope, $meteor, $ionicModal, $ionicPopup, AccessControl, $translate) {
        $scope.postBtn = "Post";
        $scope.exercises = [];

        /**
         * @summary Function to retrieve and update the voting results
         */
        $scope.updateChartValues = function () {
            $meteor.call("checkVotingStatus", $scope.item._id).then(
                function (result) {
                    $scope.$emit("hasEnded", !result);
                },
                function (err) {
                    throw new Meteor.Error(err.reason);
                }
            );
            $meteor.call('getVotingResults', $scope.item._id).then(
                function (result) {
                    $scope.chartValues = result;
                },
                function (err) {
                    console.log(err);
                }
            );
        };

        $scope.$on("loadEditData", function () {
            $scope.$parent.newItem.deadline = $scope.item.deadline;
            $scope.$parent.newItem.intermediatePublic = $scope.item.intermediatePublic;
            $scope.$parent.newItem.finalPublic = $scope.item.finalPublic;
            $scope.$parent.newItem.nrVoters = $scope.item.nrVoters;
            $scope.$parent.newItem.training_id = $scope.item.training_id;
        });

        $scope.$on("successEdit", function (e, res) {});

        $meteor.call("getTrainingObj", $scope.item.training_id).then(
            function (result) {
                $scope.item.training_date = result.date;
            },
            function (err) {
                throw new Meteor.Error(err.reason);
            }
        );

        $meteor.call('getExercises', $scope.item.training_id).then(
            function (result) {
                $scope.exercises = result;
            },
            function (err) {
                console.log(err);
            }
        );

        // Check if already voted
        $meteor.call('getResponse', $scope.item._id).then(
            function (result) {
                $scope.hasVoted = result ? result.value : 0;
            },
            function (err) {
                console.log(err);
            }
        );

        // Load results chart
        $scope.chartValues = [[0, 0, 0]];
        $scope.chartLabels = ["", "", ""];
        $scope.updateChartValues();

        $scope.select = function ($event, index) {
            // Let's try
            var elem = angular.element($event.currentTarget);
            elem.parent().parent().siblings(".image-placeholder-div").show()
                .children(".image-placeholder").attr("src", elem.children("img").attr("src"));
            if ($scope.item.selectedValue == index) {
                elem.removeClass("selected");
                elem.parent().parent().siblings(".image-placeholder-div").hide();
                $scope.item.selectedValue = "";
            } else {
                elem.addClass("selected").siblings().removeClass("selected");
                $scope.item.selectedValue = index;
            }
        };

        /**
         * @summary Function to post a vote
         */
        $scope.vote = function (value) {
            if (!value) return;
            $translate('CONFIRM_VOTE').then(function (result) {
                confirmPopup = $ionicPopup.confirm({
                    title: result
                }).then(function (res) {
                    if (res) {
                        $meteor.call('putResponse', $scope.item._id, $scope.item.type, value.toString()).then(
                            function () {
                                $scope.hasVoted = value;
                                //increase the number of votes
                                $meteor.call('increaseNrVotes', $scope.item._id, $scope.item.type, value.toString());
                            },
                            function (err) {
                                console.log(err);
                            }
                        );
                    }
                });;
            });
        };

        Items.find({_id: $scope.item._id}).observeChanges({
            changed: $scope.updateChartValues
        });
    })