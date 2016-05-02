angular.module('app.directives', [])
    .directive('post', [function () {
        return {
            restrict: 'E',
            templateUrl: 'client/views/feeditems/post.ng.html'
        }
    }])

    .directive('practicality', [function(){
        return {
            restrict: 'E',
            templateUrl: 'client/views/feeditems/practicality.ng.html'
        }
    }])

    .directive('voting', [function(){
        return {
            restrict: 'E',
            templateUrl: 'client/views/feeditems/voting.ng.html'
        }
    }]);