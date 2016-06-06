angular.module('app.controllers', [
    'userAccountControllers',
    'chatControllers',
    'votingControllers',
    'formControllers',
    'heroControllers',
    'postControllers'])

    /**
     * Menu Controller: provides all functionality for the menu of the app
     */
    .controller('menuCtrl', function ($scope, $meteor, $state, $window, currentClub) {
        /**
         * @summary Function to logout
         */
        $scope.logout = function ($event) {
            $event.stopPropagation();
            $meteor.logout(function () {
                $state.go('login').then(function () {
                    $window.location.reload();
                });
            });
        };

        /**
         * Loading the current club for styling
         */
        currentClub.getClub().then(function (result) {
            $scope.currentClub = result;
        }, function (err) {
            console.log(err);
        });
    })

    /**
     * Feed Controller: provides all functionality for the feed screen of the app
     */
    .controller('feedCtrl', function ($scope, $meteor, AccessControl) {
        // Show coach bar if needed
        AccessControl.getPermission('CoachBar', 'view', function (result) {
            $scope.showCoachBar = result;
        });

        /**
         * @summary Function to update the item types
         */
        $scope.updateItemTypes = function () {
            //if (err) throw new Meteor.Error(err.reason);
            var oldItemTypes = [];
            if ($scope.itemTypes) {
                oldItemTypes = $scope.itemTypes.reduce((result, {id, name, checked}) => {
                    result[id] = {name: name, checked: checked};
                    return result;
                }, {})
            }
            $scope.itemTypes = TypesCollection.find().fetch();
            _.each($scope.itemTypes, function (element) {
                if (oldItemTypes[element._id]) element.checked = oldItemTypes[element._id].checked;
                else element.checked = true;
            }, this);
        };

        // Load the filter
        Meteor.subscribe('ItemTypes', $scope.updateItemTypes);

        // Limit on number of feed item to display
        $scope.limit = 2;
        /* Get the number of items that can be retrieved.
         * Needed for preventing indefinite increase of limit in infiniteScroll */
        $meteor.call('getItemsCount').then(function (result) {
            $scope.maxItems = result;
        }, function (err) {
            console.log(err);
        });

        // Reactively (re)subscribe to feed items based on selected filters and limit
        Tracker.autorun(function () {
            $scope.getReactively('itemTypes', true);
            var itemTypesFilter = _.pluck(_.filter($scope.itemTypes, (type) => {
                return type.checked;
            }), '_id');
            Meteor.subscribe('Feed', itemTypesFilter, $scope.getReactively('limit'));
        });

        /**
         * Function which increases the limit for rendering feed items - infinite scroll
         */
        $scope.loadMore = function () {
            if ($scope.limit > $scope.maxItems) return;
            $scope.limit = $scope.limit + 4;
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
    .controller('newItemCtrl', function ($scope, $ionicPopover) {
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
     *  Control Item Controller: provides all functionality for the item operations popover of the app
     */
    .controller('controlItemCtrl', function ($scope, $meteor, AccessControl, $ionicPopover, $ionicPopup) {
        // Get item type
        $scope.itemType = TypesCollection.find({_id: $scope.item.type}).fetch()[0];

        /**
         * Check whether the user has permission to edit the item
         */
        $scope.showEdit = false;
        AccessControl.getPermission($scope.item.type, 'edit', function (result) {
            if (result) $scope.showEdit = result;
            // NOT REQUIRED SINCE CREATOR ID CHECK IS DONE ON SERVER
            // $meteor.call('getFeedItem', $scope.item._id).then(
            //     function (res) {
            //         $scope.showEdit = res.creatorID == Meteor.userId();
            //     }
            // );
        });

        /**
         * Check whether the user has permission to delete the item
         */
        $scope.showDelete = false;
        AccessControl.getPermission($scope.item.type, 'delete', function (result) {
            if (result) $scope.showDelete = result;
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
            var element = angular.element('ion-popover-view');
            var positionTop = parseInt(element.css('top')) + 40;
            element.css('top', positionTop+'px');
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
        $scope.showFullItem = function ($event, state) {
            var elem = angular.element($event.currentTarget);
            if (!state && $scope.isFull) {
                elem.parents(".list").css("max-height", "200px").find(".gradient").show();
                $scope.isFull = false;
            } else {
                elem.parents(".list").css("max-height", "100%").find(".gradient").hide();
                $scope.isFull = true;
            }
        };

        $scope.editItem = function() {
            if(!$scope.showEdit) return;
            switch ($scope.item.type) {
                case 'Voting':
                    $scope.$emit('editVoting', $scope.item._id);
                    break;
                case 'Form':
                    $scope.$emit('editForm', $scope.item._id);
                    break;
                case 'Post':
                    $scope.$emit('editPost', $scope.item._id);
                    break;
                case 'Heroes':
                    $scope.$emit('editHeroes', $scope.item._id);
                    break;
            }
        };

        /**
         * @summary Function to delete a feed item
         */
        $scope.deleteItem = function (itemId) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure you want to delete the feed item?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $meteor.call('deleteFeedItem', itemId);
                }
            });
        };
    })

    /**
     * Controller for settings page
     */
    .controller('settingsCtrl', function ($scope) {

    })