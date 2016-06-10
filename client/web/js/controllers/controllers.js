angular.module('web.controllers', [
    'ui.bootstrap',
    'web.userAccountControllers'])

    .controller('bodyCtrl', function ($scope, $meteor) {

        /**
         * @summary Function to check if we run in Cordova environment
         */
        $scope.isPhone = function() {
            return Meteor.isCordova;
        };

        $scope.hostname = 'http://' + window.location.hostname;

        /**
         * @summary Function for retrieving the club a user is logged into.
         * @param
         */
        $meteor.call('getClub').then(function (result) {
            $scope.currentClub = result;
        }, function (err) {
            console.log(err);
        });
    })

    /**
     *  Custom on change Controller: puts a listener on file input change
     */
    .directive('customOnChange', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.customOnChange);
                element.bind('change', onChangeHandler);
            }
        };
    })

    /**
     *  Main Controller: overarching web interface functionality.
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('mainCtrl', function ($scope, $meteor, $state) {
        /**
         * @summary This function logs out the user and redirects it to the login page.
         */
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login');
        };


    })

    /**
     *  Settings: provides the functionality for the settings page of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('settingsCtrl', function ($scope, $meteor, $timeout) {
       

        $meteor.subscribe('images');
        $meteor.subscribe('clubs');

        $scope.hostname = 'http://' + window.location.hostname;

        /**
         * @summary Function for uploading a file.
         * @method uploadFile
         * @param {Object} event The file to upload.
         * @after All the images are uploaded to the server.
         */
        $scope.uploadFile = function (event) {
            var files = event.target.files;

            for (var i = 0, ln = files.length; i < ln; i++) {
                files[i].userId = Meteor.userId();
                // Insert all the images into the Images collection.
                Images.insert(files[i], function (err, fileObj) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(fileObj.url({brokenIsFine: true}));
                        $scope.currentClub.logo = fileObj.url({brokenIsFine: true});
                    }
                });
            }
        };

        $scope.saved = false;
        /**
         * @summary Function for saving the new settings for the club.
         * @method save
         * @after The new settings are saved on the server.
         */
        $scope.save = function () {

            $scope.saved = true;
            $timeout(function () {
                $scope.saved = false;
            }, 1500);
            $meteor.call('updateClub', $scope.currentClub).then(function (result) {
                $scope.currentClub = result;
            }, function (err) {
                console.log(err);
            });

        };

        /**
         * @summary Helper functions
         * @method save
         * @param {Function} club Returns all the clubs
         * @param {Function} images Returns the images
         */
        $scope.helpers({
            club: function () {
                return Clubs.find({});
            },
            images: function () {
                return Images.find({});
            }
        });
    })