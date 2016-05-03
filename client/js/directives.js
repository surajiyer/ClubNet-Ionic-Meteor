angular.module('app.directives', [])
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
                    attrs.item.subscribers++;
                    Items.update({_id: attrs.item._id}, {$set: attrs.item});
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
            scope: false,
            replace: false,
            transclude: true,
            template: '<div class="item item-divider" ng-transclude=""></div>'
            // scope: {
            //     text: "@"
            // },
            // link: function(scope, element, attrs) {
            //     scope.text = attrs.text;
            // }
        }
    })