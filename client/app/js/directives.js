angular.module('app.directives', [])

    .directive('post', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feeditems/post.ng.html',
            scope: {
                item: "="
            }
        }
    })

    .directive('formdir', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feeditems/formdir.ng.html',
            scope: {
                item: "="
            },
            controller: 'formCtrl'
        }
    })

    .directive('hero', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feeditems/hero.ng.html',
            scope: {
                item: "="
            }

        }
    })

    .directive('voting', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feeditems/voting.ng.html',
            scope: {
                item: "="
            },
            controller: 'votingCtrl'
        }
    })

    .directive('ionItemDivider', function () {
        return {
            restrict: 'E',
            replace: false,
            transclude: true,
            template: '<div class="item item-divider" ng-transclude=""></div>'
        }
    })