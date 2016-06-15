angular.module('web.controllers', [
    'ui.bootstrap',
    'web.userAccountControllers'])

    .controller('bodyCtrl', function ($scope) {

        /**
         * @summary Function to check if we run in Cordova environment
         */
        $scope.isPhone = function () {
            return Meteor.isCordova;
        }
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
        $scope.user = {
            firstName: ''
        }

        /**
         * @summary This function logs out the user and redirects it to the login page.
         */
        $scope.logout = function () {
            $meteor.logout();
            $state.go('login');
        };
        $scope.hostname = 'https://' + window.location.hostname;

        /**
         * @summary Function for retrieving the club a user is logged into.
         * @param
         */
        $meteor.call('getClub').then(function (result) {
            $scope.currentClub = result;
            $scope.$apply();
        }, function (err) {
            console.log(err);
        });

        if (Meteor.user() != undefined) {
            $scope.user.firstName = Meteor.user().profile.firstName
        } else {
            setTimeout(function () {
                if (Meteor.user() != undefined) {
                    $scope.user.firstName = Meteor.user().profile.firstName
                    $scope.$apply();
                }
            }, 250);
        }
    })

    /**
     *  Redirect to application controller: Everything needed to redirect link to the mobile application
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('redirectCtrl', function ($location, $window, $scope) {
        // Get url
        var url = $location.url();
        console.log(url);

        // Get redirect token
        var token = url.substr(url.lastIndexOf('/'));
        console.log("Token: " + url.substr(url.lastIndexOf('/')));

        // Fix url for retrieving format
        var lastIndex = url.lastIndexOf("/");
        url = url.substring(0, lastIndex)

        // Get redirect sort
        var sort = url.substr(url.lastIndexOf('/') + 1);
        console.log("Sort: " + url.substr(url.lastIndexOf('/') + 1));

        $scope.redirectURL = 'clubnet://' + sort + token;
        console.log($scope.redirectURL);

        $window.close()

    })

    /**
     *  Settings: provides the functionality for the settings page of the web interface
     *  @param {String} Name of the controller
     *  @param {Function}
     */
    .controller('settingsCtrl', function ($scope, $meteor, $timeout, $translate) {
        /**
         * @summary Function for retrieving the image URL for the club logo, which is in the database
         */
        $meteor.call('getImage').then(function (result) {
            //console.log(result);
        }, function (err) {
            console.log(err);
        });

        $meteor.subscribe('images');
        $meteor.subscribe('clubs');

        $scope.hostname = 'http://' + window.location.hostname;

        /**
         * @summary Function for uploading an image file.
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
                        $scope.currentClub.logo = Meteor.absoluteUrl(fileObj.url({brokenIsFine: true}));
                    }
                });
            }
        };

        $scope.error = '';
        $scope.errorVisible = false;
        $scope.updatedVisible = false;

        /**
         * @summary Function for saving the new settings for the club.
         * @method save
         * @after The new settings are saved on the server.
         */
        $scope.save = function () {
            if (!$scope.currentClub.name) {
                $translate('MISSING_CLUB_NAME').then(function (error) {
                    $scope.error = error;
                });
                $scope.updatedVisible = false;
                $scope.errorVisible = true;
            } else {
                $meteor.call('updateClub', $scope.currentClub).then(function (result) {
                    $scope.error = '';
                    $scope.errorVisible = false;
                    $scope.updatedVisible = true;
                }, function (err) {
                    $scope.error = 'err';
                    $scope.updatedVisible = false;
                    $scope.errorVisible = true;
                });
            }
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