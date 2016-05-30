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

    .directive('input', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                'returnClose': '=',
                'onReturn': '&',
                'onFocus': '&',
                'onBlur': '&'
            },
            link: function (scope, element) {
                element.bind('focus', function (e) {
                    if (!scope.onFocus) return;

                    $timeout(() => {
                        scope.onFocus();
                    });
                });

                element.bind('blur', function (e) {
                    if (!scope.onBlur) return;

                    $timeout(() => {
                        scope.onBlur();
                    });
                });

                element.bind('keydown', function (e) {
                    if (e.which != 13) return;

                    if (scope.returnClose) {
                        element[0].blur();
                    }

                    if (scope.onReturn) {
                        $timeout(() => {
                            scope.onReturn();
                        });
                    }
                });
            }
        }
    })