angular.module('postControllers', [])

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
        $ionicModal.fromTemplateUrl('client/app/views/feedItems/newPost.ng.html', {
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