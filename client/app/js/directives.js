angular.module('app.directives', [])

    .directive('scrolly', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var raw = element[0];
                element.bind('scroll', function () {

                    var top = raw.scrollTop + raw.offsetHeight + parseInt(attrs.threshold);
                    if (top > raw.scrollHeight) {
                        scope.$apply(attrs.scrolly);
                    }
                });
            }
        };
    })

    .directive('formdir', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feedItems/form.ng.html',
            scope: {
                item: "="
            },
            controller: 'formCtrl'
        }
    })

    .directive('hero', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feedItems/hero.ng.html',
            scope: {
                item: "="
            },
            controller: 'heroCtrl'
        }
    })

    .directive('sponsoring', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feedItems/sponsoring.ng.html',
            scope: {
                item: "="
            },
            controller: 'sponsoringCtrl'
        }
    })

    .directive('voting', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feedItems/voting.ng.html',
            scope: {
                item: "="
            },
            controller: 'votingCtrl'
        }
    })

    .directive('chatInfo', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/chats/chatInfo.ng.html',
            scope: {
                chat: "="
            },
            controller: 'chatInfoCtrl'
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