angular.module('app.controllers', [])

//add: angular.module('somethingHere', ['infinite-scroll']); ??
//or should it be in the app.js angular.module ?

    // .controller('InfiniteScroll', function($scope) {
    //     $scope.items = []; //get items from database here?
    //     //use the same functionality as we are now to fetch items from the database
    //    
    //     $scope.loadMore = function() {
    //         //8 is predefined, just sets how many we load each time
    //         for (var i = 1; i <= 8; i++) {
    //             //get new items and put them into the items array
    //             //use the same functionality as we are now to fetch items from the database
    //             $scope.items.push();
    //         }
    //     };
    // })

    .controller('registerCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.register = function () {
            if (!$scope.user.email)
                throw new Meteor.Error('Account registration error: e-mail is not valid');
            var newUser = {
                email: $scope.user.email,
                password: $scope.user.password,
                profile: {
                    firstName: "p",
                    lastName: "1",
                    type: "player",
                    clubID: "club",
                    teamID: "team1"
                }
            };
            Meteor.call('addUser', newUser, function (err, result) {
                if (err || !Match.test(result, String))
                    throw new Meteor.Error('Account registration error: ' + err.reason);
                Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                    if (error) throw new Meteor.Error(error.reason);
                    $state.go('menu.feed'); // Redirect user if registration succeeds
                });
            });
        };
    })

    .controller('loginCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            email: '',
            password: ''
        };

        $scope.login = function () {
            Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    throw new Meteor.Error(error.reason);
                }
                $state.go('menu.feed');
            });
        };

        $scope.goToRemindPassword = function () {
            $state.go('forgotPassword');
        }
    })

    .controller('forgotPasswordCtrl', function ($scope) {
        $scope.forgotUser = {
            email: '',
            token: '',
            newPassword: ''
        };

        $scope.resetPassword = function () {
            Accounts.resetPassword($scope.forgotUser.token, $scope.forgotUser.newPassword, function (err) {
                if (err) throw new Meteor.Error('Forgot password error: ' + err.reason);
                console.log('Reset password success');
            });
        };

        $scope.forgotPassword = function () {
            if (!$scope.forgotUser.email)
                throw new Meteor.Error('PLEASE ENTER EMAIL ADDRESS U BITCH');
            Accounts.forgotPassword({email: $scope.forgotUser.email}, function (err) {
                if (err) throw new Meteor.Error('Forgot password error: ' + err.reason);
            });
        };
    })

    .controller('profileCtrl', function ($scope, $meteor, $state) {
        $scope.temp_user = {
            email: '',
            fullName: ''
        };

        $scope.temp_pass = {
            oldPass: '',
            newPass: '',
            newPassCheck: ''
        };

        $scope.changeGeneralProfileInfo = function () {
            var email = $scope.temp_user.email;
        };

        $scope.changePassword = function () {
            if ($scope.temp_pass.newPass == $scope.temp_pass.newPassCheck) {
                $meteor.changePassword($scope.temp_pass.oldPass, $scope.temp_pass.newPass).then(function () {
                    console.log('Change password success');
                    $state.go('menu.feed');
                }, function (error) {
                    $scope.error = error.reason;
                    $scope.errorVisible = {'visibility': 'visible'};
                    console.log('Error changing password - ', error);
                });
            } else {
                $scope.error = "The passwords don't match.";
            }
        };

        $scope.error = '';
        $scope.errorVisible = {'visibility': 'hidden'};
    })

    .controller('menuCtrl', function ($scope, $meteor, $state, $window, currentClub) {
        $scope.logout = function ($event) {
            $event.stopPropagation();
            $meteor.logout();
            $state.go('login').then(function () {
                $window.location.reload();
            });
        };

        currentClub.getClub().then(function(result){
             $scope.currentClub = result;
        }, function(err){
            console.log(err);
        });
    })

    .controller('feedCtrl', function ($scope, AccessControl, $meteor) {
        // Display coach bar
        AccessControl.getPermission('CoachBar', 'view', function (result) {
            $scope.showCoachBar = result;
        });
        
        $scope.updateItemTypes = function() {
            //if (err) throw new Meteor.Error(err.reason);
            var oldItemTypes = [];
            if ($scope.itemTypes) {
                oldItemTypes = $scope.itemTypes.reduce((result, {id, name, checked}) => {
                    result[id] = {name: name, checked: checked};
                    return result;
                }, {})
            }
            $scope.itemTypes = TypesCollection.find().fetch();
            _.each($scope.itemTypes, function (element) {
                if (oldItemTypes[element._id]) element.checked = oldItemTypes[element._id].checked;
                else element.checked = true;
            }, this);
        };

        $scope.limit = 2;

        // Load the filter
        Meteor.subscribe('ItemTypes', $scope.updateItemTypes);

        Tracker.autorun(function () {
            $scope.getReactively('itemTypes', true);
            $scope.itemTypesFilter = _.pluck(_.filter($scope.itemTypes, (type) => {
                return type.checked;
            }), '_id');
            Meteor.subscribe('Feed', $scope.getReactively('itemTypesFilter'), $scope.getReactively('limit'));
        });
        
        /* Call to get the number of items that could possible be retrieved.
        *  Needed for preventing indefinite increase of limit in infiniteScroll */
        $meteor.call('getItemsCount').then(function(result){
            $scope.maxItems = result;
        }, function(err){
            console.log(err);
        });
        
        /* Function which increases the limit for rendering feed items - infinite scroll */
        $scope.loadMore = function() {
            if ($scope.limit > $scope.maxItems) return;
            var len = $scope.limit;
            $scope.limit = len + 1;
        };

        /* Function to get current date in ISO format */
        $scope.getCurrentDateISO = function(){
            var date = new Date();
            date.setDate(date.getDate()-1);
            return date.toISOString().substring(0, 10);
        };

        // Set display filter model
        $scope.showFilter = false;

        // Display/hide filter
        $scope.openFilter = function () {
            $scope.showFilter = !$scope.showFilter;
        };

        $scope.helpers({
            items: function () {
                return Items.find({}, {sort: {sticky: -1, createdAt: -1}});
            }
        });
    })

    .controller('popoverCtrl', function ($scope, $ionicPopover) {
        /* POPOVER */
        $ionicPopover.fromTemplateUrl('client/app/views/popover.ng.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
    })

    .controller('ItemCtrl', function ($scope) {
        if (!$scope.item) {
            throw new Error("No item object passed.");
        }
    })

    .controller('controlItemCtrl', function ($scope, $ionicPopover) {
        /* POPOVER */
        $ionicPopover.fromTemplateUrl('client/app/views/itemOperations.ng.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
    })

    /**
     * @summary Controller for loading chats.
     */
    .controller('chatsCtrl', function ($scope, Chat) {
        $scope.addChat = function() {

        };

        $scope.helpers({
            chats: Chat.getChats
        });
    })

    /**
     * @summary Controller for loading chat info in each chat.
     */
    .controller('chatInfoCtrl', function ($scope, Chat) {
        $scope.helpers({
            // Load chat info
            chat: function() {
                return Chat.getOneChat($scope.chat._id);
            }
        });
    })

    /**
     * @summary Controller for chatting functions within chats.
     */
    .controller('chatCtrl', function ($scope, $state, $stateParams, Chat) {
        // Load chat info
        Chat.getOneChat($stateParams.chatId);

        $scope.helpers({
            messages: function () {
                return Messages.find({chatId: chat._id});
            },
            chat: function () {
                return Chats.find({_id: chat._id});
            }
        });
    })

    .controller('postCtrl', function ($scope, $ionicModal) {
        /* Post */
        $scope.newPost = {};

        $scope.post = function () {
            $scope.newPost.type = 'Post';
            $scope.newPost.createdAt = new Date;
            Meteor.call('addFeedItem', $scope.newPost);
            $scope.newPost = {};
            $scope.closePost();
        };

        $ionicModal.fromTemplateUrl('client/app/views/feeditems/newPost.ng.html', {
            scope: $scope
        }).then(function (postmodal) {
            $scope.postmodal = postmodal;
        });

        $scope.closePost = function () {
            $scope.postmodal.hide();
        };

        $scope.openPost = function () {
            $scope.postmodal.show();
        };
    })

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

        $ionicModal.fromTemplateUrl('client/app/views/feeditems/newForm.ng.html', {
            scope: $scope
        }).then(function (formModal) {
            $scope.formModal = formModal;
        });

        $scope.closeForm = function () {
            $scope.formModal.hide();
        };

        $scope.openForm = function () {
            $scope.formModal.show();
        };

        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Please select target value'
            });
        };

        // Check if user has contributed to this item when initialising
        if ($scope.item != null) {
            $scope.item.hasContributed = false;
            $meteor.call('getResponse', $scope.item._id).then(
                function (result) {
                    if (result != null) {
                        $scope.item.hasContributed = result;
                    }
                },
                function (err) {
                    console.log(err);
                }
            );
        }

        $scope.signUp = function (value) {
            if (value) {
                $meteor.call('putResponse', $scope.item._id, $scope.item.type, value).then(
                    function (result) {
                        $scope.item.hasContributed = value;
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }

        };

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

    .controller('votingCtrl', function ($scope, $ionicModal, $meteor, $ionicPopup, $http) {
        /* Voting */
        $scope.newVoting = {};
        $scope.editingItem = 0;

        $scope.selectedValue = '';

        $scope.trainings = [];
        $scope.exercises = [];

        $meteor.call('getTrainings').then(
            function (result) {
                $scope.trainings = result;
            },
            function (err) {
                console.log(err);
            }
        );

        //console.log($meteor.call("getTrainingObj", "eToCn46ZEfsgsFxXh"));

        //console.log(_.find([{name: 3}, {name: 4}], function(obj){ return obj.name == 3; }));

        $scope.addVoting = function () {
            $scope.newVoting.type = 'Voting';
            $scope.newVoting.published = true;
            $scope.newVoting.createdAt = new Date;
            $scope.newVoting.nrVotes = 0;
            $scope.newVoting.ended = false;
            $scope.newVoting.teamID = Meteor.user().profile.teamID;
            if ($scope.editingItem == 0) {
                $meteor.call('addFeedItem', $scope.newVoting, function (err) {
                    // TODO: do something with error (show as popup?)
                    if (err) console.log(err);
                });
            } else {
                $scope.newVoting._id = $scope.item._id;
                console.log("We need to update the table.");
                console.log($scope.newVoting);
                $meteor.call('updateFeedItem', $scope.newVoting, function (err) {
                    // TODO: do something with error (show as popup?)
                    if (err) console.log(err);
                });
                $meteor.call("getTrainingObj", $scope.newVoting.training_id).then(
                    function (result) {
                        $scope.item.training_date = result.date;
                    },
                    function (err) {}
                );
            }
            $scope.newVoting = {};
            $scope.closeVoting();
        };

        $ionicModal.fromTemplateUrl('client/app/views/feeditems/newVoting.ng.html', {
            scope: $scope
        }).then(function (votingModal) {
            $scope.votingModal = votingModal;
        });

        $scope.closeVoting = function () {
            $scope.votingModal.hide();
        };

        $scope.openVoting = function (itemId = 0) {
            $scope.editingItem = itemId;
            if (itemId != 0) {
                getElement = Items.findOne({_id: itemId});
                $scope.newVoting = {
                    title: getElement.title,
                    deadline: getElement.deadline,
                    description: getElement.description,
                    intermediatePublic: getElement.intermediatePublic,
                    finalPublic: getElement.finalPublic,
                    nrVoters: getElement.nrVoters,
                    training_id: getElement.training_id,
                };
            }
            $scope.votingModal.show();
        };

        $scope.deleteItem = function (itemId) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure you want to delete the feed item?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $meteor.call('deleteFeedItem', itemId);
                }
            });
        };

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

        if ($scope.item != null) {
            $scope.hasVoted = false;
            $scope.hasEnded = false;

            $meteor.call("getTrainingObj", $scope.item.training_id).then(
                function (result) {
                    $scope.item.training_date = result.date;
                },
                function (err) {}
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
                    $scope.hasEnded = result.length >= $scope.item.nrVoters
                        || today > $scope.item.deadline;
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
            $scope.chartLabels = [1, 2, 3];
        }

        $scope.select = function ($event, index) {
            // Let's try
            elem = angular.element($event.currentTarget);
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

        $scope.vote = function (value) {
            if (value) {
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
            } else {
                console.log('Please select what are you voting for');
            }
        };
    })

    .controller('heroCtrl', function ($scope, $ionicModal) {
        /* Post */
        $scope.newHero = {};

        $scope.hero = function () {
            $scope.newHero.type = 'Heroes';
            $scope.newHero.createdAt = new Date;
            $scope.newHero.image = 'http://www.placehold.it/300x300';
            $scope.newHero.published = true;
            Meteor.call('addFeedItem', $scope.newHero, function (err) {
                // TODO: do something with error (show as popup?)
                if (err) console.log(err);
            });
            $scope.newHero = {};
            $scope.closeHero();
        };

        $ionicModal.fromTemplateUrl('client/app/views/feeditems/newHero.ng.html', {
            scope: $scope
        }).then(function (heromodal) {
            $scope.heromodal = heromodal;
        });

        $scope.closeHero = function () {
            $scope.heromodal.hide();
        };

        $scope.openHero = function () {
            $scope.heromodal.show();
        };
    })

    .controller('settingsCtrl', function ($scope, $http) {

    });