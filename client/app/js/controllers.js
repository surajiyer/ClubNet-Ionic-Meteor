angular.module('app.controllers', [])

    .controller('ItemCtrl', function ($scope) {
        if (!$scope.item) {
            throw new Error("No item object passed.");
        }
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

    .controller('menuCtrl', function ($scope, $meteor, $state, $window) {
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login').then(function () {
                $window.location.reload();
            });
        }
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

    .controller('forgotPasswordCtrl', function ($scope, $meteor, $state, $ionicHistory) {
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
                    firstName: "abc",
                    lastName: "def",
                    type: "coach",
                    clubID: "PSV",
                    teamID: "dadada"
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

    .controller('feedCtrl', function ($scope, AccessControl) {
        // Display coach bar
        AccessControl.getPermission('CoachBar', 'view', function (result) {
            $scope.showCoachBar = result;
        });

        // Load the filter
        Meteor.subscribe('ItemTypes', function () {
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
        });

        Tracker.autorun(function () {
            $scope.getReactively('itemTypes', true);
            $scope.itemTypesFilter = _.pluck(_.filter($scope.itemTypes, (type) => {
                return type.checked;
            }), '_id');
            $scope.subscribe('Feed', function () {
                return [$scope.itemTypesFilter];
            });
        });

        $scope.getCurrentDateISO = function(){
            return new Date().toISOString().substring(0, 10);
        }

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

    .controller('chatsCtrl', function ($scope, $state, $stateParams) {

        //  $scope.helpers({
        //       data() {
        //         return Chats.find();
        //       }
        //     });
        // }

        //     $scope.chats = [
        //   {
        //     _id: 0,
        //     name: 'Ethan Gonzalez',
        //     picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
        //     lastMessage: {
        //       text: 'You on your way?',
        //       timestamp: Moment().subtract(1, 'hours').toDate()
        //     }
        //   },
        //   {
        //     _id: 1,
        //     name: 'Bryan Wallace',
        //     picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
        //     lastMessage: {
        //       text: 'Hey, it\'s me',
        //       timestamp: Moment().subtract(2, 'hours').toDate()
        //     }
        //   },
        //   {
        //     _id: 2,
        //     name: 'Avery Stewart',
        //     picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
        //     lastMessage: {
        //       text: 'I should buy a boat',
        //       timestamp: Moment().subtract(1, 'days').toDate()
        //     }
        //   },
        //   {
        //     _id: 3,
        //     name: 'Katie Peterson',
        //     picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
        //     lastMessage: {
        //       text: 'Look at my mukluks!',
        //       timestamp: Moment().subtract(4, 'days').toDate()
        //     }
        //   },
        //   {
        //     _id: 4,
        //     name: 'Ray Edwards',
        //     picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
        //     lastMessage: {
        //       text: 'This is wicked good ice cream.',
        //       timestamp: Moment().subtract(2, 'weeks').toDate()
        //     }
        //   }
        // ];

        Meteor.subscribe('Chats');

        $scope.helpers({
            chats: function () {
                return Chats.find();
            }
        });
    })

    .controller('chatCtrl', function ($scope, $state, $stateParams) {

        Meteor.subscribe('Messages');

        //Messages.insert({ name: "Test", picture: "https://randomuser.me/api/portraits/thumb/men/2.jpg", chatId: "zf5jab8eKzu6ptC6s" });
        //Messages.find({ chatId: "zf5jab8eKzu6ptC6s" }).fetch();
        /*
          chats.forEach((chat) =&gt; {
            const message = Messages.findOne({ chatId: { $exists: false } });
            chat.lastMessage = message;
            const chatId = Chats.insert(chat);
            Messages.update(message._id, { $set: { chatId } });
          });
        */
        //Messages.update({_id : "F3Mg9KMfPFYmoxRuj"}, {$set:{chatId : "zf5jab8eKzu6ptC6s"}});


        var chatId = $stateParams.chatId;
        console.log(chatId);
     
        $scope.helpers({
            messages: function () {
                return Messages.find({ chatId: chatId });
            },
            chat: function () {
                return Chats.findOne(chatId);
            }
        });


    })


    .controller('postCtrl', function ($scope, $ionicModal) {
        /* Post */
        $scope.newPost = {};

        $scope.post = function () {
            $scope.newPost.type = 'Post';
            $scope.newPost.createdAt = new Date;
            Items.insert($scope.newPost);
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

        $scope.showAlert = function() {
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
                        $scope.item.hasContributed = !!value;
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }

        };

        $scope.withdrawContribution = function () {
            $meteor.call('deleteResponse', $scope.item._id).then(
                function(result){
                    $scope.item.hasContributed = false;
                },
                function(err){
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

        $scope.trainings  = [];
        $scope.exercises  = [];

        $http.get('/trainings.json')
            .then(function(res){
                xa = res.data;
                for (var key in xa) {
                    for (var key2 in xa[key]) {
                        $scope.trainings.push(xa[key][key2]);
                    }
                }
            }, function() {
                console.log("lol");
            });

        $scope.addVoting = function () {
            $scope.newVoting.type = 'Voting';
            $scope.newVoting.published = true;
            $scope.newVoting.createdAt = new Date;
            $scope.newVoting.nrVotes = 0;
            $scope.newVoting.ended = false;
            $scope.newVoting.teamID = Meteor.user().profile.teamID;
            $scope.newVoting.exercises = [
                {
                    _id: '1',
                    name: 'pirmas',
                    image: 'http://placehold.it/100x100'
                },
                {
                    _id: '2',
                    name: 'antras',
                    image: 'http://www.printsonwood.com/media/catalog/product/cache/1/image/650x/040ec09b1e35df139433887a97daa66f/g/r/grumpy-cat-rainbow-square_PRINT-crop-1x1.jpg.thumbnail_7.jpg'
                },
                {
                    _id: '3',
                    name: 'trecias',
                    image: 'http://i3.cpcache.com/product/1293587386/rootin_for_putin_square_sticker.jpg?height=225&width=225'
                }
            ];
            if ($scope.editingItem == 0) {
                $meteor.call('DBHelper.addFeedItem', $scope.newVoting, function (err) {
                    // TODO: do something with error (show as popup?)
                    if (err) console.log(err);
                });
            } else {
                console.log("We need to update the table.");
                console.log($scope.newVoting);
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
                getElement = Items.findOne({_id : itemId});
                $scope.newVoting = {
                    title: getElement.title,
                    deadline: getElement.deadline,
                    description: getElement.description,
                    intermediatePublic: getElement.intermediatePublic,
                    finalPublic: getElement.finalPublic,
                    nrVoters: getElement.nrVoters,
                };
            }
            $scope.votingModal.show();
        };

        $scope.deleteItem = function(itemId) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure you want to delete the feed item?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    $meteor.call('deleteFeedItem', itemId);
                }
            });
        };
        
        $scope.updateChartValues = function() {
            $meteor.call('getVotingResults', $scope.item._id).then(
                function(result){
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
                        $scope.hasVoted = !!result;
                    },
                    function (err) {
                        console.log(err);
                    }
                );

            // Load results chart
            $scope.chartValues = [[0, 0, 0]];
            $scope.updateChartValues();
            $scope.chartLabels = _.pluck($scope.item.exercises, 'name');
        }

        $scope.select = function ($event, exer_id) {
            // Let's try
            $scope.item.selectedValue = exer_id;
            elem = angular.element($event.currentTarget);
            elem.parent().parent().siblings(".image-placeholder-div").show()
                .children(".image-placeholder").attr("src", elem.children("img").attr("src"));
            elem.addClass("selected").siblings().removeClass("selected");
        };

        $scope.vote = function (value) {
            if (value) {
                $meteor.call('putResponse', $scope.item._id, $scope.item.type, value).then(
                    function (result) {
                        $scope.updateChartValues();
                        $scope.hasVoted = !!value;
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