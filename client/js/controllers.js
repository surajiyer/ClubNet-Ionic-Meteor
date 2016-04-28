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

.controller('feedCtrl', function($scope,$state,$stateParams,$ionicModal,$meteor) {
    $scope.posts = $meteor.collection(Posts);

    $scope.newPost={};

    $scope.post = function () {
        $scope.posts.push( $scope.newPost );
        $scope.newPost={};
        $scope.closePost();
    };

    $ionicModal.fromTemplateUrl('client/views/newpost.ng.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.closePost = function() {
        $scope.modal.hide();
    };

    $scope.openPost = function() {
        $scope.modal.show();
    };
})
 