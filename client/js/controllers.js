angular.module('app.controllers', [])
  
.controller('pollsCtrl', function($scope) {

})
   
.controller('practicalitiesCtrl', function($scope) {

})
   
.controller('sponsoringCtrl', function($scope) {

})
      
.controller('settingsCtrl', function($scope) {

})
   
.controller('loginCtrl', function($scope) {

})

.controller('feedCtrl', function($scope,$state,$stateParams,$ionicModal,$meteor,$ionicPopover) {
    $scope.posts = $meteor.collection(Posts);
    
    /* Post */

    $scope.newPost={};

    $scope.post = function () {
        $scope.newPost.type = '1';
        $scope.posts.push( $scope.newPost );
        $scope.newPost={};
        $scope.closePost();
    };

    $ionicModal.fromTemplateUrl('client/views/feeditems/newpost.ng.html', {
        scope: $scope
    }).then(function(postmodal) {
        $scope.postmodal = postmodal;
    });

    $scope.closePost = function() {
        $scope.postmodal.hide();
    };

    $scope.openPost = function() {
        $scope.postmodal.show();
    };

    /* Practicality*/

    $scope.newPracticality={};

    $scope.practicality = function () {
        $scope.newPracticality.type = '2';
        $scope.posts.push( $scope.newPracticality );
        $scope.newPracticality={};
        $scope.closePracticality();
    };

    $ionicModal.fromTemplateUrl('client/views/feeditems/practicality.ng.html', {
        scope: $scope
    }).then(function(practicalityModal) {
        $scope.practicalityModal = practicalityModal;
    });

    $scope.closePracticality = function() {
        $scope.practicalityModal.hide();
    };

    $scope.openPracticality = function() {
        $scope.practicalityModal.show();
    };


    /* POPOVER */
    $ionicPopover.fromTemplateUrl('client/views/popover.ng.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.popover = popover;
    });
    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };
    $scope.closePopover = function() {
        $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.popover.remove();
    });

})