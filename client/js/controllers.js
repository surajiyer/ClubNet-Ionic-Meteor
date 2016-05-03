angular.module('app.controllers', [])
    .controller('pollsCtrl', function ($scope) {

    })

    .controller('settingsCtrl', function ($scope) {

    })

    .controller('loginCtrl', function ($scope) {

    })

    .controller('feedCtrl', function ($scope, $state, $stateParams, $ionicModal, $meteor) {
        $scope.items = $meteor.collection(Items); // gets all the items
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

        $ionicModal.fromTemplateUrl('client/views/feeditems/newpost.ng.html', {
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

    .controller('practicalityCtrl', function ($scope, $ionicModal) {
        /* Practicality*/
        $scope.newPracticality = {};

        $scope.practicality = function () {
            $scope.newPracticality.subscribers = 0;
            $scope.newPracticality.type = 'Practicality';
            $scope.newPracticality.timestamp = new Date().valueOf();
            Items.insert($scope.newPracticality);
            //$scope.items.push($scope.newPracticality);
            $scope.newPracticality = {};
            $scope.closePracticality();
        };

        $ionicModal.fromTemplateUrl('client/views/feeditems/newPracticality.ng.html', {
            scope: $scope
        }).then(function (practicalityModal) {
            $scope.practicalityModal = practicalityModal;
        });

        $scope.closePracticality = function () {
            $scope.practicalityModal.hide();
        };

        $scope.openPracticality = function () {
            $scope.practicalityModal.show();
        };
    })

    .controller('votingCtrl', function ($scope, $ionicModal) {
        /* Voting */
        $scope.newVoting = {};

        $scope.voting = function () {
            $scope.newVoting.type = 'Voting';
            $scope.newVoting.timestamp = new Date().valueOf();
            Items.insert($scope.newVoting);
            //$scope.items.push($scope.newVoting);
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