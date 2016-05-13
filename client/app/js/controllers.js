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
            var oldPass = $scope.temp_pass.oldPass;
            var newPass = $scope.temp_pass.newPass;
            var newPassCheck = $scope.temp_pass.newPassCheck;

            if (newPass == newPassCheck) {
                console.log("De wachtwoorden komen overeen.")
                $meteor.changePassword(oldPass, newPass).then(function () {
                    console.log('Change password success');
                    $state.go('menu.feed');
                }, function (err) {
                    console.log('Error changing password - ', err);
                });
            }
            else if (newPass != newPassCheck) {
                console.log("De wachtwoorden komen niet overeen.")
            }
        }
    })

    .controller('menuCtrl', function ($scope, $meteor, $state) {
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login');
        }
    })

    .controller('loginCtrl', function ($scope, $meteor, $state) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.login = function () {
            $meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    console.log(error.reason); // Output error if login fails
                } else {
                    $state.go('menu.feed'); // Redirect user if login succeeds
                }
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

    .controller('registerCtrl', function ($scope, $state) {
        $scope.register = function () {
            var email = $('[name=regemail]').val();
            var password = $('[name=regpassword]').val();
            console.log(email);
            console.log(password);
            if (email != '' && password != '') {
                Accounts.createUser({
                    email: email,
                    password: password
                }, function (error) {
                    if (error) {
                        console.log(error.reason); // Output error if registration fails
                    } else {
                        $state.go('menu.feed'); // Redirect user if registration succeeds
                    }
                });

            } else {
                console.log('Please fill in email and password');
            }

        }
    })

    .controller('feedCtrl', function ($scope, CoachAccess) {
        $scope.itemTypes = [
            {type: 'Voting', name: "Exercise voting", checked: true},
            {type: 'Form', name: "Form", checked: true},
           // {type: 'Sponsoring', name: "Sponsoring", checked: true},
           // {type: 'Betting', name: "Betting pool", checked: true},
            {type: 'Hero', name: "Hero of the week", checked: true},
           // {type: 'Suggest', name: "Suggest exercise", checked: true},
            {type: 'Post', name: "Post", checked: true}
        ];

        $scope.itemTypes2 = ['Voting', 'Form', 'Hero', 'Post'];

        $scope.$watch('itemTypes', function(newValue, oldValue) {
            $scope.itemTypes.forEach(function(item, index){
                if (oldValue[index].checked != newValue[index].checked) {
                    if (item.checked == true) {
                        var i = includes(item.type);
                        if (i == -1) {
                            $scope.itemTypes2.push(item.type);
                        }
                    } else if (item.checked == false) {
                        var i = includes(item.type);
                        if (i != -1) {
                            $scope.itemTypes2.splice(i, 1);
                        }
                    }
                }
            });
        }, true);

        function includes(k) {
            for(var i=0; i < $scope.itemTypes2.length; i++){
                if( $scope.itemTypes2[i] == k  ){
                    return i;
                }
            }
            return -1;
        }
        
        $scope.showFilter = false;
        
        $scope.openFilter = function () {
            $scope.showFilter = !$scope.showFilter;
        };

        Meteor.subscribe('Feed', function () {
            return [ this.getCollectionReactively('itemTypes2') ];
        });

        $scope.helpers({
            items: function () {
                return Items.find({}, {sort: {timestamp: -1}});
            },
            showCoachBar: function() {
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
            //$scope.items.push($scope.newPost);
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

