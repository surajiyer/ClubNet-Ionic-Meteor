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

/**
 *  Register Controller: provides all functionality for the register screen of the app
 *  @param {String} Name of the controller
 *  @param {Function}
 */
    .controller('registerCtrl', function ($scope, $meteor, $state) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };
        /**
         * @summary Function to register a new user
         */
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

    /**
     *  Login Controller: provides all functionality for the login screen of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('loginCtrl', function ($scope, $meteor, $state) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };
        /**
         * @summary Function for a user to login
         */
        $scope.login = function () {
            console.log('pressedlogin');
            Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    throw new Meteor.Error(error.reason);
                }
                $state.go('menu.feed');
            });
        };

        /**
         * @summary Function to show the forgot password page
         */
        $scope.goToRemindPassword = function () {
            $state.go('forgotPassword');
        }
    })

    /**
     *  Forgot Password Controller: provides all functionality for the forgot password screen of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('forgotPasswordCtrl', function ($scope) {
        /**
         * Information of the user who forgot his password
         */
        $scope.forgotUser = {
            email: '',
            token: '',
            newPassword: ''
        };

        /**
         * @summary Function to reset the users password
         */
        $scope.resetPassword = function () {
            Accounts.resetPassword($scope.forgotUser.token, $scope.forgotUser.newPassword, function (err) {
                if (err) throw new Meteor.Error('Forgot password error: ' + err.reason);
                console.log('Reset password success');
            });
        };

        /**
         * @summary Function to send email to user to reset password
         */
        $scope.forgotPassword = function () {
            if (!$scope.forgotUser.email)
                throw new Meteor.Error('PLEASE ENTER EMAIL ADDRESS U BITCH'); // Nice error +1
            Accounts.forgotPassword({email: $scope.forgotUser.email}, function (err) {
                if (err) throw new Meteor.Error('Forgot password error: ' + err.reason);
            });
        };
    })

    /**
     *  Profile Controller: provides all functionality for the Profile screen of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('profileCtrl', function ($scope, $meteor, $state) {
        /**
         * Profile information
         */
        $scope.temp_user = {
            email: '',
            fullName: ''
        };

        /**
         * Password information
         */
        $scope.temp_pass = {
            oldPass: '',
            newPass: '',
            newPassCheck: ''
        };

        /**
         * @summary Function to change the profile information
         */
        $scope.changeGeneralProfileInfo = function () {
            var email = $scope.temp_user.email;
        };

        /**
         * @summary Function to change the password information
         */
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

        /**
         * Data for error message
         */
        $scope.error = '';
        $scope.errorVisible = {'visibility': 'hidden'};
    })

    /**
     *  Menu Controller: provides all functionality for the menu of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('menuCtrl', function ($scope, $meteor, $state, $window, currentClub) {
        /**
         * @summary Function to logout
         */
        $scope.logout = function ($event) {
            $event.stopPropagation();
            $meteor.logout(function() {
                $state.go('login').then(function () {
                    $window.location.reload();
                });
            });
        };

        $scope.pushy = function(){
            console.log('will-send-push-noti');
            Push.send({
                from: 'Test',
                title: 'Hello',
                text: 'World',
                badge: 12,
                query: {}
            });

        };

        /**
         * Loading the current club for styling
         */
        currentClub.getClub().then(function (result) {
            $scope.currentClub = result;
        }, function (err) {
            console.log(err);
        });
    })

    /**
     *  Feed Controller: provides all functionality for the feed screen of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('feedCtrl', function ($scope, AccessControl, $meteor) {

        Push.addListener('token', function(token) {
            console.log('Token: ' + JSON.stringify(token));
            alert('Token: ' + JSON.stringify(token));
        });
        console.log('Push.id(): ' + Push.id());
        console.log('testas');
        /**
         * Show coach bar if needed
         */
        AccessControl.getPermission('CoachBar', 'view', function (result) {
            $scope.showCoachBar = result;
        });

        /**
         * @summary Function to update the item types
         */
        $scope.updateItemTypes = function () {
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

        // Initialise limit for feed items
        $scope.limit = 10;

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
        $meteor.call('getItemsCount').then(function (result) {
            $scope.maxItems = result;
        }, function (err) {
            console.log(err);
        });

        /* Function which increases the limit for rendering feed items - infinite scroll */
        $scope.loadMore = function () {
            if ($scope.limit > $scope.maxItems) return;
            var len = $scope.limit;
            $scope.limit = len + 1;
        };

        /* Function to get current date in ISO format */
        $scope.getCurrentDateISO = function () {
            var date = new Date();
            date.setDate(date.getDate() + 1);
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

    /**
     *  Popover Controller: provides all functionality for the popover screen of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
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

    /**
     *  Item Controller: provides all functionality for a item of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('ItemCtrl', function ($scope) {
        if (!$scope.item) {
            throw new Error("No item object passed.");
        }
    })

    /**
     *  Control Item Controller: provides all functionality for the item operations popover of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('controlItemCtrl', function ($scope, $ionicPopover) {
        /* POPOVER */
        $ionicPopover.fromTemplateUrl('client/app/views/itemOperations.ng.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
            $event.stopPropagation();
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
     *  @summary Controller for loading chats
     */
    .controller('chatsCtrl', function ($scope, $ionicModal, $state, AccessControl, Chat) {
        /**
         * Show the create chat button
         * @type {boolean}
         */
        $scope.canCreateChat = false;

        // Display create chat button
        AccessControl.getPermission('Chat', 'create', function (result) {
            $scope.canCreateChat = result;
        });

        $ionicModal.fromTemplateUrl('client/app/views/newChat.ng.html', {
            scope: $scope
        }).then(function (chatModal) {
            $scope.chatModal = chatModal;
        });

        /**
         * Open the Create New Chat modal.
         */
        $scope.addChat = function () {
            $scope.chatModal.show();
        };

        /**
         * Close the Create New Chat modal.
         */
        $scope.closeModal = function () {
            $scope.chatModal.hide();
        };

        /**
         * Start a new chat with the given userId.
         * @param userId
         */
        $scope.startChat = function (userId) {
            if (!$scope.canCreateChat) return;
            $scope.closeModal();
            var chat = Chat.getChatByUserId(userId);
            if (chat) {
                Chat.updateChatStatus(chat._id, "open");
                $state.go('menu.chat', {chatId: chat._id});
            } else {
                var chatID = Chat.createChat(userId);
                console.log('createChat() chatId: '+chatID);
                $state.go('menu.chat', {chatId: chatID});
            }
        };

        $scope.helpers({
            /**
             * Get a list of all chat sessions.
             */
            chats: Chat.getChats,
            /**
             * Get a list of all users you can create a chat with.
             * @returns {*}
             */
            users: function () {
                return Meteor.users.find({_id: {$ne: Meteor.userId()}});
            }
        });
    })

    /**
     *  @summary Controller for loading information of each chat
     */
    .controller('chatInfoCtrl', function ($scope, Chat) {
        $scope.helpers({
            // Load chat info
            chat: function () {
                return Chat.getOneChat($scope.chat._id);
            }
        });
    })

    /**
     *  @summary Controller for chatting functions within chats
     */
    .controller('chatCtrl', function ($scope, $state, $stateParams, Chat) {
        /**
         * Initialize messages
         * @type {*|any}
         */
        var chatID = $stateParams.chatId;
        Meteor.subscribe('Messages', chatID);
        
        $scope.isMe = function(senderID) {
            return senderID == Meteor.userId();
        }

        /**
         * @summary Function to send a message
         */
        $scope.sendMessage = function () {
            // Send the message and get the new message id
            var messageID = Chat.sendMessage(chatID, $scope.message);

            // If message was sent successfully, clear the message field
            if(messageID) {
                $scope.message = "";
            }
            
            console.log("sendMessage() message: "+$scope.message);
        };

        /**
         * Helper functions
         */
        $scope.helpers({
            chat: function () {
                return Chat.getOneChat(chatID);
            },
            messages: function () {
                return Chat.getMessages(chatID);
            }
        });
    })

    /**
     *  Post Controller: provides all functionality for the new post screen of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
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
        /**
         * Load new post template
         */
        $ionicModal.fromTemplateUrl('client/app/views/feeditems/newPost.ng.html', {
            scope: $scope
        }).then(function (postmodal) {
            $scope.postmodal = postmodal;
        });

        /**
         * @summary Function close the post modal
         */
        $scope.closePost = function () {
            $scope.postmodal.hide();
        };

        /**
         * @summary Function to open the post modal
         */
        $scope.openPost = function () {
            $scope.postmodal.show();
        };
    })

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
            Meteor.call('addFeedItem', $scope.newForm);
            $scope.newForm = {};
            $scope.closeForm();
        };

        /**
         * @summary Load the new form template
         */
        $ionicModal.fromTemplateUrl('client/app/views/feeditems/newForm.ng.html', {
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
            $meteor.call("getItemType", $scope.item.type).then(
                function (result) {
                    $scope.itemType = result;
                },
                function (err) {
                }
            );

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

        /**
         * @summary Function to sign up
         */
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

    /**
     *  Voting Controller: provides all functionality for the voting feed item of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('votingCtrl', function ($scope, $ionicModal, $meteor, $ionicPopup, AccessControl) {
        /* Voting */
        $scope.newVoting = {};
        $scope.editingItem = 0;
        $scope.postBtn = "Post";

        $scope.trainings = [];
        $scope.exercises = [];

        AccessControl.getPermission('Voting', 'edit', function (result) {
            if (result) {
                $meteor.call('getFeedItem', $scope.item._id).then(
                    function(res) {
                        $scope.showEdit = res.creatorID == Meteor.userId();
                    }
                );
            } else {
                $scope.showEdit = false;
            }
        });

        /**
         * Check whether the user is a coach
         */
        AccessControl.getPermission('Voting', 'edit', function (result) {
            $scope.isCoach = result;
        });

        /**
         * @summary Function to retrieve trainings
         */
        $meteor.call('getTrainings').then(
            function (result) {
                $scope.trainings = result;
            },
            function (err) {
                console.log(err);
            }
        );

        /**
         * @summary Function to add a new voting feed item
         */
        $scope.addVoting = function () {
            if ($scope.editingItem == 0) {
                $scope.newVoting.type = 'Voting';
                $scope.newVoting.published = true;
                $scope.newVoting.createdAt = new Date;
                $scope.newVoting.nrVotes = 0;
                $scope.newVoting.ended = false;
                $meteor.call('addFeedItem', $scope.newVoting, function (err) {
                    // TODO: do something with error (show as popup?)
                    if (err) console.log(err);
                });
            } else {
                $scope.newVoting.type = $scope.item.type;
                $scope.newVoting.published = $scope.item.published;
                $scope.newVoting.createdAt = $scope.item.createdAt;
                $scope.newVoting.nrVotes = $scope.item.nrVotes;
                $scope.newVoting.ended = $scope.item.ended;
                $scope.newVoting.teamID = $scope.item.teamID;
                $scope.newVoting.nrVoters = $scope.item.nrVoters;
                $scope.newVoting._id = $scope.item._id;
                $meteor.call('updateFeedItem', $scope.newVoting, function (err) {
                    // TODO: do something with error (show as popup?)
                    if (err) console.log(err);
                });
                $meteor.call("getTrainingObj", $scope.newVoting.training_id).then(
                    function (result) {
                        $scope.item.training_date = result.date;
                    },
                    function (err) {
                    }
                );
            }
            $scope.newVoting = {};
            $scope.closeVoting();
            $scope.postBtn = "Post";
        };

        /**
         * Get new voting template
         */
        $ionicModal.fromTemplateUrl('client/app/views/feeditems/newVoting.ng.html', {
            scope: $scope
        }).then(function (votingModal) {
            $scope.votingModal = votingModal;
        });

        /**
         * @summary Function to close the voting
         */
        $scope.closeVoting = function () {
            $scope.votingModal.hide();
        };

        /**
         * @summary Function to open the voting
         */
        $scope.openVoting = function (itemId = 0) {
            $scope.editingItem = itemId;
            if (itemId != 0) {
                $scope.postBtn = "Save";
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

        /**
         * @summary Function to delete the voting
         */
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

        if ($scope.item != null) {
            $scope.hasVoted = false;
            $scope.hasEnded = false;

            /**
             * Check whether the user has permission to add the item
             */
            AccessControl.getPermission('Voting', 'edit', function (result) {
                if (result) {
                    $meteor.call('getFeedItem', $scope.item._id).then(
                        function (res) {
                            $scope.showEdit = res.creatorID == Meteor.userId();
                        }
                    );
                } else {
                    $scope.showEdit = false;
                }
            });

            $meteor.call("getItemType", $scope.item.type).then(
                function (result) {
                    $scope.itemType = result;
                },
                function (err) {
                }
            );

            $meteor.call("getTrainingObj", $scope.item.training_id).then(
                function (result) {
                    $scope.item.training_date = result.date;
                },
                function (err) {
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
            $meteor.call('getTeamSize').then(
                function (result) {
                    console.log(result);
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

        /**
         * @summary Function to post a vote
         */
        $scope.vote = function (value) {
            if (value) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Are you sure you want to place your vote?'
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
                console.log('Please select what are you voting for');
            }
        };

        $scope.isFull = false;
        /**
         * @summary Function to enlarge the feed item
         */
        $scope.showFullItem = function ($event, state) {
            elem = angular.element($event.currentTarget);
            if (!state && $scope.isFull) {
                elem.parents(".list").css("max-height", "200px").find(".gradient").show();
                $scope.isFull = false;
            } else {
                elem.parents(".list").css("max-height", "100%").find(".gradient").hide();
                $scope.isFull = true;
            }
        };
    })

    /**
     *  Hero Controller: provides all functionality for the heroes feed item of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
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

    /**
     *  Settings Controller: provides all functionality for the settings screen of the app
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('settingsCtrl', function ($scope, $http) {

    });