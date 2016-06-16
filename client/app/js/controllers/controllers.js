angular.module('app.controllers', [
    'userAccountControllers',
    'chatControllers',
    'votingControllers',
    'formControllers',
    'heroControllers',
    'sponsoringControllers'])

    /**
     * Menu Controller: provides all functionality for the menu of the app
     */
    .controller('menuCtrl', function ($scope, $meteor, $state, $window, Chat) {
        /**
         * To check if user has permission to view chat option
         * @type {boolean}
         */
        $scope.showChat = false;
        $scope.autorun(function () {
            $scope.showChat = Chat.canViewChat();
        });

        /**
         * @summary Function to logout
         */
        $scope.logout = function () {
            $meteor.logout(function () {
                $state.go('login');
            });
        };

        /**
         * Loading the current club for styling, return an alert when an error is thrown
         */
        $meteor.call('getClub').then(function (result) {
            $scope.currentClub = result;
            jQuery('ion-header-bar.bar-stable').css('background', $scope.currentClub.colorAccent + '!important');
        }, function (err) {
            return CommonServices.showAlert(err.error + ' ' + err.reason, err.message);
        });
    })

    /**
     * Feed Controller: provides all functionality for the feed screen of the app
     */
    .controller('feedCtrl', function ($scope, $meteor) {
        /**
         * @summary Show the plus button if user has rights to add at least any kind of item
         */
        $scope.$on("showAddItem", function () {
            $scope.showAddItem = true;
        });

        /**
         * @summary Function to update the item types
         */
        Meteor.call('getItemTypes', function (err, result) {
            if (!err && result) {
                $scope.itemTypes = result;

                // Load filter from item types
                _.each($scope.itemTypes, function (element) {
                    element.checked = true;
                });
            }
        });

        // Limit on number of feed item to display
        $scope.limit = 10;

        /* Get the number of items that can be retrieved.
         * Needed for preventing indefinite increase of limit in infiniteScroll */
        $meteor.call('getItemsCount').then(function (result) {
            $scope.maxItems = result;
        }, function (err) {
            console.log(err);
        });

        // Reactively (re)subscribe to feed items based on selected filters and limit
        $scope.autorun(function () {
            $scope.getReactively('itemTypes', true);
            var itemTypesFilter = _.pluck(_.filter($scope.itemTypes, (type) => {
                return type.checked;
            }), '_id');
            $scope.subscribe('Feed', () => {
                return [itemTypesFilter, $scope.getReactively('limit')];
            });
        });

        /**
         * Function which increases the limit for rendering feed items - infinite scroll
         */
        $scope.loadMore = function () {
            if ($scope.limit > $scope.maxItems) return;
            $scope.limit = $scope.limit + 2;
        };

        /**
         * Function to get current date in ISO format
         */
        $scope.getCurrentDateISO = function () {
            var date = new Date();
            date.setDate(date.getDate() + 1);
            return date.toISOString().substring(0, 10);
        };

        // Set display filter model
        $scope.showFilter = false;

        // Display/hide filter
        $scope.openFilter = function () {
            $scope.showFilter = !$scope.showFilter;
        };

        $scope.helpers({
            items: function () {
                return Items.find({}, {sort: {sticky: -1, createdAt: -1}});
            }
        });

    })

    /**
     *  New Item Controller: provides all functionality for the popover screen of the app
     */
    .controller('addNewItemCtrl', function ($scope, $ionicPopover) {
        $ionicPopover.fromTemplateUrl('client/app/views/popover.ng.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };

        $scope.closePopover = function () {
            $scope.popover.hide();
        };

        // Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });

    })

    /**
     *  New Item Controller: provides all functionality for the popover screen of the app
     */
    .controller('newItemCtrl', function ($scope, $meteor, $ionicModal, AccessControl, CommonServices, $ionicPopup) {
        $scope.newItem = {};
        $scope.trainings = [];

        /**
         * @summary Function to retrieve trainings
         */
        $meteor.call('getTrainings').then(
            function (result) {
                $scope.trainings = result;
            },
            function (err) {
                console.log(err);
            }
        );

        /**
         * @summary Displays an alert that serves as more information on 'the target value'.
         * @method showAlertTargetValueInfo
         * @after Alert is launched
         */
        $scope.showAlertTargetValueInfo = function () {
            CommonServices.showAlert('More information', 'The target value can be used to set the goal of the practicality. It is advised to mention the measurement unit in the description. For example: You need 14 car-spots for driving, you set the target-value to 11 and in the description you mention that you are searching for 11 spots');
        };

        /**
         * @summary Displays an alert that serves as more information on 'the repeat interval'.
         * @method showAlertRepeatInterval
         * @after Alert is launched
         */
        $scope.showAlertRepeatInterval = function () {
            CommonServices.showAlert('More information', 'The repeat interval defines the time after which you want the feed item to reset itself.');
        };

        $scope.showCreate = false;
        AccessControl.getPermission($scope.type._id, 'create', function (result) {
            $scope.showCreate = result;
            if (result) {
                $scope.$emit("showAddItem");
            }
        });

        $ionicModal.fromTemplateUrl('client/app/views/feedItems/new' + $scope.type._id + '.ng.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function () {
            $scope.modal.show();
            $scope.postBtn = "Create";
        };

        /**
         * @summary Function to close the voting
         */
        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        $scope.getPicture = function () {
            var cameraOptions = {
                quality: 80,
                correctOrientation: true,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };

            MeteorCamera.getPicture(cameraOptions, function (error, localData) {
                $scope.image = localData;
                $scope.$apply();
            });
        };

        $scope.addItem = function () {
            $scope.newItem.type = $scope.type._id;
            $scope.newItem.image = $scope.image;
            Meteor.call('addFeedItem', $scope.newItem);
            $scope.newItem = {};
            $scope.closeModal();
        };
    })

    /**
     *  Control Item Controller: provides all functionality for the item operations popover of the app
     */
    .controller('generalItemCtrl', function ($scope, $meteor, AccessControl,
                                             $ionicPopover, $ionicPopup, $ionicModal, CommonServices, $translate) {
        // Get item type
        $scope.newItem = {};
        Meteor.call('getItemType', $scope.item.type, function (err, result) {
            if (!err && result) {
                $scope.itemType = result;
            }
        });
        $scope.trainings = [];
        $scope.hasEnded = false;

        $scope.showItem = false;
        AccessControl.getPermission($scope.item.type, 'view', function (result) {
            $scope.showItem = result;
        });

        $scope.$on("hasEnded", function (event, bool) {
            $scope.hasEnded = bool;
        });

        /**
         * @summary Function to retrieve trainings
         */
        $meteor.call('getTrainings').then(
            function (result) {
                $scope.trainings = result;
            },
            function (err) {
                console.log(err);
            }
        );

        /**
         * Check whether the user has permission to edit the item
         */
        $scope.showEdit = false;
        AccessControl.getPermission($scope.item.type, 'edit', function (result) {
            $scope.showEdit = result && $scope.item.creatorID == Meteor.userId();
        });

        /**
         * Check whether the user has permission to delete the item
         */
        $scope.showDelete = false;
        AccessControl.getPermission($scope.item.type, 'delete', function (result) {
            $scope.showDelete = result && $scope.item.creatorID == Meteor.userId();
        });

        /* POPOVER */
        $ionicPopover.fromTemplateUrl('client/app/views/itemOperations.ng.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function ($event) {
            $event.stopPropagation();
            $scope.popover.show($event);
        };

        $scope.closePopover = function () {
            $scope.popover.hide();
        };

        // Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });

        /**
         * Used to control if full displayed or partially displayed
         */
        $scope.isFull = false;

        /**
         * @summary Function to enlarge the feed item
         */
        $scope.showFullItem = function ($event) {
            var elem = angular.element($event.currentTarget);
            if ($scope.isFull) {
                elem.parents(".list").css("height", "200px").find(".gradient").show();
                elem.parents(".list").find(".read-less").hide();
            } else {
                elem.parents(".list").css("height", "100%").find(".gradient").hide();
                elem.parents(".list").find(".read-less").show();
            }
            $scope.isFull = !$scope.isFull;
        };

        /**
         * Get new voting template
         */
        $ionicModal.fromTemplateUrl('client/app/views/feedItems/new' + $scope.item.type + '.ng.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        /**
         * @summary Function to open the voting
         */
        $scope.editItem = function () {
            $scope.newItem._id = $scope.item._id;
            $scope.newItem.title = $scope.item.title;
            $scope.$broadcast("loadEditData");
            $scope.postBtn = "Save";
            $scope.modal.show();
        };

        /**
         * @summary Function to close the voting
         */
        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        /**
         * @summary Function to add a new voting feed item
         */
        $scope.edit = function () {
            $scope.newItem.type = $scope.item.type;
            $scope.newItem.creatorID = $scope.item.creatorID;
            $meteor.call('updateFeedItem', $scope.newItem).then(
                function (result) {
                    $scope.$broadcast("successEdit", result);
                },
                function (err) {
                    console.log(err);
                }
            );
            $scope.newItem = {};
            $scope.closeModal();
        };

        /**
         * @summary Function to delete a feed item
         */
        $scope.deleteItem = function () {
            $translate('CONFIRM_DELETE').then(function (result) {
                var confirmPopup = $ionicPopup.confirm({
                    title: result
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        $meteor.call('deleteFeedItem', $scope.item._id);
                    }
                });
            });
        };

        /**
         * @summary Sticky/Unsticky a feed item
         */
        $scope.stickyItem = function () {
            var obj = {
                _id: $scope.item._id,
                type: $scope.item.type,
                creatorID: $scope.item.creatorID,
                sticky: !$scope.item.sticky
            };
            Meteor.call("updateFeedItem", obj, function (err, result) {
                if (err) {
                    return CommonServices.showAlert('Error', err.reason);
                }
                if (!result) {
                    return CommonServices.showAlert('Error',
                        'Something unexpected happened. Unable to update sticky item.');
                }
            });
        }
    })

    /**
     * Controller for settings page
     */
    .controller('settingsCtrl', function ($scope, $meteor, $translate, $state) {
        // Get current language
        $scope.selectedLanguage = $translate.use();

        $scope.updateLanguage = function (selectedLanguage) {
            $scope.selectedLanguage = selectedLanguage;
            check($scope.selectedLanguage, String);
            try {
                $translate.use($scope.selectedLanguage);
                $state.reload();
            } catch (e) {
                $translate('ERROR').then(function (ERROR) {
                    CommonServices.showAlert(ERROR, e.reason);
                });
                return;
            }
        };

        $scope.updateNotificationSetting = function (key, value) {
            $meteor.call('updateUserNotificationSetting', key, value);
        };
    })