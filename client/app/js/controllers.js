angular.module('app.controllers', [])
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
                $scope.error = 'De wachtwoorden komen niet overeen.'
            }
        }

        $scope.error = '';
        $scope.errorVisible = {'visibility': 'hidden'};
    })

    .controller('menuCtrl', function ($scope, $meteor, $state) {
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login');
        }
    })

    .controller('loginCtrl', function ($scope, $meteor, $state, LoginAccount) {
        $scope.user = {
            email: '',
            password: ''
        };
        
        $scope.login = function () {
            var login = LoginAccount.myFunc($scope.user.email, $scope.user.password);
            if (login) {
                $state.go('menu.feed'); // Redirect user if login succeeds
            }
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
            $meteor.resetPassword($scope.forgotUser.token, $scope.forgotUser.newPassword).then(function () {
                console.log('Reset password success');
            }, function (err) {
                console.log('Error resetting password - ', err);
            });
        };

        $scope.forgotPassword = function () {
            if ($scope.forgotUser.email != '') {
                $meteor.forgotPassword({email: $scope.forgotUser.email}).then(function () {
                    console.log('Success sending forgot password email');
                }, function (err) {
                    console.log('Error sending forgot password email - ', err);
                });
            } else {
                console.log('PLEASE ENTER EMAIL ADDRESS U BITCH');
            }

        };

        $scope.goBack = function () {
            $ionicHistory.goBack();
        };
    })

    .controller('registerCtrl', function ($scope, $meteor, $state, UserAccount) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.register = function () {
            UserAccount.register(
                $scope.user.email,
                $scope.user.password,
                function () {
                    $state.go('menu.feed'); // Redirect user if registration succeeds                    
                },
                function (error) {
                    console.log('Register error: ' + error); // Output error if registration fails
                }
            )
        }
    })

    .controller('feedCtrl', function ($scope, CoachAccess) {
        // Subscribe to the feed
        Meteor.subscribe('Feed');

        // Load the filter
        Meteor.call('ItemTypes', function (err, result) {
            if (err) throw new Meteor.Error(err.error);
            var oldItemTypes = [];
            if ($scope.itemTypes) {
                oldItemTypes = $scope.itemTypes.reduce((result, {id, name, checked}) => {
                    result[id] = {name: name, checked: checked};
                    return result;
                }, {})
            }
            $scope.itemTypes = result;
            _.each($scope.itemTypes, function (element) {
                if (oldItemTypes[element._id]) element.checked = oldItemTypes[element._id].checked;
                else element.checked = true;
            }, this);
        });

        // Set display filter model
        $scope.showFilter = false;

        // Display/hide filter
        $scope.openFilter = function () {
            $scope.showFilter = !$scope.showFilter;
        };


        //  console.log(items);

        $scope.helpers({
            items: function () {
                $scope.getReactively('itemTypes', true);
                if (!$scope.itemTypes) return;
                var itemTypesFilter = _.pluck(_.filter($scope.itemTypes, (type) => {
                    return type.checked
                }), '_id');
                Meteor.call("DBHelper.getFeed", itemTypesFilter, function (result) {
                    console.log(result);
                });
                //return Items.find({'itemType': {$in: itemTypesFilter}}, {sort: {timestamp: -1}});
                return Meteor.call("DBHelper.getFeed", itemTypesFilter);
            },
            showCoachBar: function () {
                return CoachAccess.showCoachBar.get();
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
            $scope.newPost.timestamp = new Date().valueOf();
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

    .controller('formCtrl', function ($scope, $ionicModal) {
        /* Practicality*/
        $scope.newForm = {};

        $scope.form = function () {
            $scope.newForm.subscribers = 0;
            $scope.newForm.type = 'Form';
            $scope.newForm.timestamp = new Date().valueOf();
            Items.insert($scope.newForm);
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

    .controller('votingCtrl', function ($scope, $ionicModal) {
        /* Voting */
        $scope.newVoting = {};

        $scope.voting = function () {
            $scope.newVoting.type = 'Voting';
            $scope.newVoting.timestamp = new Date().valueOf();
            Items.insert($scope.newVoting);
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
    })

    .controller('heroCtrl', function ($scope, $ionicModal) {
        /* Post */
        $scope.newHero = {};

        $scope.hero = function () {
            $scope.newHero.type = 'Hero';
            $scope.newHero.timestamp = new Date().valueOf();
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

