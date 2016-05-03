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
            templateUrl: 'client/views/feeditems/practicality.ng.html',
            link: function(scope, element, attrs) {
                scope.signUp = function(item) {
                    item.subscribers++;
                    Items.update({_id: item._id}, {$set: item});
                };
                
                scope.refuse = function() {
                    console.log('refuse');
                };
            }
        }
    }])

    .directive('voting', [function(){
        return {
            restrict: 'E',
            templateUrl: 'client/views/feeditems/voting.ng.html'
        }
    }])

    .directive('ionItemDivider', [function(){
        return {
            restrict: 'E',
            scope: {
                text: "@"
            },
            template: '<div class="item item-divider"></div>'
        }
    }])