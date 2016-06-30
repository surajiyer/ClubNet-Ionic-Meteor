angular.module('app.directives', [])
    /**
     * Directive for practicality forms
     */
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

    /**
     * Directive for practicality forms
     */
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

    /**
     * Directive for Heroes item
     */
    .directive('hero', function () {
        return {
            restrict: 'E',
            templateUrl: 'client/app/views/feedItems/heroes.ng.html',
            scope: {
                item: "="
            },
            controller: 'heroCtrl'
        }
    })

    /**
     * Directive for Sponsoring item
     */
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

    /**
     * Directive for voting items
     */
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

    /**
     * Directive for chat information. Multiples instances of this chat will be
     * loaded on the Chats page for each chat in the user's chat history.
     */
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

    /**
     * Directive for ionic horizontal line dividers in vertical ionic lists.
     */
    .directive('ionItemDivider', function () {
        return {
            restrict: 'E',
            replace: false,
            transclude: true,
            template: '<div class="item item-divider" ng-transclude=""></div>'
        }
    })

    /**
     * Directive for handling special chat messaging input feedback.
     */
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