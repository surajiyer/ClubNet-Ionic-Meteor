angular.module('votingControllers', [])

/**
 *  Voting Controller: provides all functionality for the voting feed item of the app
 *  @param {String} Name of the controller
 *  @param {Function}
 */
    .controller('votingCtrl', function ($scope, $meteor, $ionicModal, $ionicPopup) {
        /* Voting */
        $scope.editingItem = 0;
        $scope.postBtn = "Post";

        $scope.exercises = [];

        /**
         * @summary Function to retrieve and update the voting results
         */
        $scope.updateChartValues = function () {
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

        $scope.$on("successEdit", function (e, res) {
            $meteor.call("getTrainingObj", res.training_id).then(
                function (result) {
                    $scope.item.training_date = result.date;
                },
                function (err) {
                    throw new Meteor.Error(err.reason);
                }
            );
            console.log(res);
        });

        if ($scope.item != null) {
            $scope.hasVoted = false;
            $scope.hasEnded = false;

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

            // Check if voting has ended because the deadline has passed
            // or if number of votes exceeds allowed number of voters
            $meteor.call('getResponsesOfOneItem', $scope.item._id).then(
                function (result) {
                    var today = new Date;
                    // TODO: remove nrVoters from the item collection
                    $scope.hasEnded = today > $scope.item.deadline;
                },
                function (err) {
                    console.log(err);
                }
            );

            $meteor.call('getNumberResponsesOfOneItem', $scope.item._id).then(
                function (nr1) {
                    $meteor.call('getTeamSize').then(
                        function (nr2) {
                            if (nr1 == nr2) {
                                $scope.hasEnded = true;
                            }
                        },
                        function (err) {
                            console.log(err);
                        }
                    );
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
            $scope.updateChartValues();
            $scope.chartLabels = ["", "", ""];
        }

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
            if (value) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Confirm vote'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $meteor.call('putResponse', $scope.item._id, $scope.item.type, value.toString()).then(
                            function (result) {
                                $scope.updateChartValues();
                                $scope.hasVoted = value;
                            },
                            function (err) {
                                console.log(err);
                            }
                        );
                        $meteor.call('getResponsesOfOneItem', $scope.item._id).then(
                            function (result) {
                                if (result.length >= $scope.item.nrVoters) {
                                    $scope.hasEnded = true;
                                }
                            },
                            function (err) {
                                console.log(err);
                            }
                        );
                    }
                });
            } else {
                console.log('Please select what you are voting for');
            }
        };
    })