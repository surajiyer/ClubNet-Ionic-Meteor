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
            $state.go('login').then(function(){
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

        $scope.goBack = function () {
            $ionicHistory.goBack();
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
                if (err || typeof result !== 'string')
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
        AccessControl.getPermission('coachbar', 'view', function (result) {
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

        Tracker.autorun(function() {
            $scope.getReactively('itemTypes', true);
            $scope.itemTypesFilter = _.pluck(_.filter($scope.itemTypes, (type) => { return type.checked; }), '_id');
            $scope.subscribe('Feed', function() {
                return [$scope.itemTypesFilter];
            });
        });

        $scope.openDetails = function () {
            console.log("poep");
        };
        
        
        // Subscribe to the feed
        // $scope.subscribe('Feed', function(){
        //     console.log($scope.getCollectionReactively('itemTypesFilter'));
        //     return [$scope.getCollectionReactively('itemTypesFilter')];
        // });

        // Set display filter model
        $scope.showFilter = false;

        // Display/hide filter
        $scope.openFilter = function () {
            $scope.showFilter = !$scope.showFilter;
        };

        $scope.helpers({
            items: function () {
                return Items.find({}, {sort: {timestamp: -1}});
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

    .controller('postCtrl', function ($scope, $ionicModal) {
        /* Post */
        $scope.newPost = {};

        $scope.post = function () {
            $scope.newPost.type = 'Post';
            $scope.newPost.timestamp = new Date;
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

    .controller('formCtrl', function ($scope, $ionicModal, $meteor) {
        /* Practicality*/
        $scope.newForm = {};

        $scope.form = function () {

            $scope.newForm.creatorID = Meteor.userId();
            $scope.newForm.type = 'Form';
            $scope.newForm.clubID = Meteor.user().profile.clubID;
            $scope.newForm.status = 'published';
            $scope.newForm.timestamp = new Date;
            $scope.newForm.raised = '0';
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
    })

    .controller('votingCtrl', function ($scope, $ionicModal, $meteor) {
        /* Voting */
        $scope.newVoting = {};

        $scope.selectedValue = '';

        $scope.addVoting = function () {
            console.log($scope.newVoting.title);
            $scope.newVoting.creatorID = Meteor.userId();
            $scope.newVoting.type = 'Voting';
            $scope.newVoting.clubID = Meteor.user().profile.clubID;
            $scope.newVoting.status = 'published';
            $scope.newVoting.timestamp = new Date;
            $scope.newVoting.nrVotes = 0;
            $scope.newVoting.ended = false;
            $scope.newVoting.teamID = Meteor.user().profile.teamID;
            $scope.newVoting.exercises = [
                {id: 1, name: 'pirmas', image: 'http://placehold.it/100x100'},
                {
                    id: 2,
                    name: 'antras',
                    image: 'http://www.printsonwood.com/media/catalog/product/cache/1/image/650x/040ec09b1e35df139433887a97daa66f/g/r/grumpy-cat-rainbow-square_PRINT-crop-1x1.jpg.thumbnail_7.jpg'
                },
                {
                    id: 3,
                    name: 'trecias',
                    image: 'http://i3.cpcache.com/product/1293587386/rootin_for_putin_square_sticker.jpg?height=225&width=225'
                }
            ];
            $meteor.call('addFeedItem', $scope.newVoting);
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

        $scope.openVoting = function () {
            $scope.votingModal.show();
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

            // Check if voting has ended because it reached limit of voters
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

            // Check if voting has ended because the deadline has passed
            var today = new Date;
            if (today > $scope.item.deadline) {
                $scope.hasEnded = true;
            }

            $meteor.call('getResponse', $scope.item._id).then(
                function (result) {
                    $scope.hasVoted = result;
                },
                function (err) {
                    console.log(err);
                }
            );
            $scope.updateChartValues();
            $scope.chartLabels = _.map($scope.item.exercises, function (exercise) {
                return exercise.name
            });
            $scope.chartValues = [[0, 0, 0]];
        }

        $scope.select = function ($event, exer_id) {
            // Let's try
            $scope.item.selectedValue = exer_id;
            elem = angular.element($event.currentTarget);
            parent_div = elem.parent().parent().siblings(".image-placeholder-div")
            parent_div.show();
            elem.siblings().removeClass("selected");
            elem.addClass("selected");
            parent_div.children(".image-placeholder").attr("src", elem.children("img").attr("src"));
        };

        $scope.vote = function (itemID, itemType, value) {
            if (value) {
                var userID = Meteor.userId();
                $meteor.call('putResponse', itemID, userID, itemType, value).then(
                    function (result) {
                        $scope.updateChartValues();
                        $scope.hasVoted = value;
                    },
                    function (err) {
                        console.log(err);
                    }
                );
                $meteor.call('getResponsesOfOneItem', $scope.item._id).then(
                    function(result){
                        if (result.length >= $scope.item.nrVoters) {
                            $scope.hasEnded = true;
                        }
                    },
                    function (err){
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
            $scope.newHero.timestamp = new Date;
            Items.insert($scope.newHero);
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

    .controller('pollsCtrl', function ($scope) {

    })

    .controller('settingsCtrl', function ($scope) {

    })

    .controller('postDetailCtrl', function ($scope, $state, $stateParams) {
        var itemID = $stateParams.itemID;
        console.log(itemID);
        $scope.autorun(function () {
            $scope.item = Items.find({_id: itemID}).fetch()[0];
            console.log($scope.item);
        });
    })

    .controller('votingDetailCtrl', function ($scope, $state, $stateParams, $meteor) {
        var itemID = $stateParams.itemID;
        console.log(itemID);
        $scope.autorun(function () {
            $scope.item = Items.find({_id: itemID}).fetch()[0];
            console.log($scope.item);
        });

        $scope.selectedValue = '';

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
            $meteor.call('getResponse', $scope.item._id).then(
                function (result) {
                    $scope.hasVoted = result;
                },
                function (err) {
                    console.log(err);
                }
            );
            $scope.updateChartValues();
            $scope.chartLabels = _.map($scope.item.exercises, function (exercise) {
                return exercise.name
            });
            $scope.chartValues = [[0, 0, 0]];
        }

        $scope.select = function ($event, exer_id) {
            // Let's try
            $scope.item.selectedValue = exer_id;
            elem = angular.element($event.currentTarget);
            parent_div = elem.parent().parent().siblings(".image-placeholder-div")
            parent_div.show();
            elem.siblings().removeClass("selected");
            elem.addClass("selected");
            parent_div.children(".image-placeholder").attr("src", elem.children("img").attr("src"));
        };

        $scope.vote = function (itemID, itemType, value) {
            if (value) {
                var userID = Meteor.userId();
                $meteor.call('putResponse', itemID, userID, itemType, value).then(
                    function (result) {
                        $scope.updateChartValues();
                        $scope.hasVoted = value;
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

    .controller('heroDetailCtrl', function ($scope, $state, $stateParams) {
        var itemID = $stateParams.itemID;
        console.log(itemID);
        $scope.autorun(function () {
            $scope.item = Items.find({_id: itemID}).fetch()[0];
            console.log($scope.item);
        });
    })

    .controller('formdirDetailCtrl', function ($scope, $state, $stateParams) {
        var itemID = $stateParams.itemID;
        console.log(itemID);
        $scope.autorun(function () {
            $scope.item = Items.find({_id: itemID}).fetch()[0];
            console.log($scope.item);
        });
    })


