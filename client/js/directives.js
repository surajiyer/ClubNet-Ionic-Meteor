angular.module('app.directives', [])
    .controller('ItemCtrl', function($scope) {
        if(!$scope.item) {
            throw new Error("No item object passed.");
        }
    })

    .directive('post', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/views/feeditems/post.ng.html',
            scope: {
                item: "="
            }
        }
    })

    .directive('practicality', function(){
        return {
            restrict: 'E',
            templateUrl: 'client/views/feeditems/practicality.ng.html',
            scope: {
                item: "="
            },
            link: function(scope, element, attrs) {
                scope.signUp = function() {
                    scope.item.subscribers++;
                    Items.update({_id: scope.item._id}, {$set: scope.item});
                };

                scope.refuse = function() {
                    console.log('Refuse');
                };
            }
        }
    })

    .directive('voting', function(){
        return {
            restrict: 'E',
            templateUrl: 'client/views/feeditems/voting.ng.html',
            scope: {
                item: "="
            }
        }
    })

    .directive('ionItemDivider', function(){
        return {
            restrict: 'E',
            replace: false,
            transclude: true,
            template: '<div class="item item-divider" ng-transclude=""></div>'
        }
    })