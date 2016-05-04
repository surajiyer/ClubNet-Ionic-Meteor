angular.module('app.controllers', [])
    .controller('pollsCtrl', function ($scope) {

    })

    .controller('settingsCtrl', function ($scope) {

    })

    .controller('loginCtrl', function ($scope) {

    })

    .controller('feedCtrl', function ($scope, $meteor) {
        $scope.itemTypes = [
            {name: "Exercise voting", checked: true},
            {name: "Form", checked: true},
            {name: "Sponsoring", checked: false},
            {name: "Betting pool", checked: true},
            {name: "Hero of the week", checked: false},
            {name: "Suggest exercise", checked: true}
        ];
        $scope.showFilter = false;
        $scope.openFilter = function () {
            $scope.showFilter = !$scope.showFilter;
        }
        $scope.helpers({
            items: function() {
                return Items.find({}, {sort: {timestamp: -1}});
            }
        });
    })

    .controller('popoverCtrl', function ($scope, $ionicPopover) {
        /* POPOVER */
        $ionicPopover.fromTemplateUrl('client/views/popover.ng.html', {
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

        $ionicModal.fromTemplateUrl('client/views/feeditems/newPost.ng.html', {
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

        $ionicModal.fromTemplateUrl('client/views/feeditems/newForm.ng.html', {
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

        $ionicModal.fromTemplateUrl('client/views/feeditems/newVoting.ng.html', {
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

        $ionicModal.fromTemplateUrl('client/views/feeditems/newHero.ng.html', {
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