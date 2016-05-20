angular.module('app.services', [])

    .factory('BlankFactory', [function () {

    }])

    .service('AccessControl', function () {
        /**
         * Check if user is permitted to get access to various aspects of the service.
         * @param role the type of user eg.: coach, player...
         * @param itemType the item for which permission is being requested
         * @param permission the type of permission being requested for the item: create, view, edit or delete.
         * @param callback function to call with the result as argument
         */
        this.getPermission = function (itemType, permission, callback) {
            Meteor.call('checkRights', itemType, permission, function (err, result) {
                if (err) throw new Meteor.Error(err.error);
                if (typeof result !== 'boolean')
                    throw new Meteor.Error('Unexpected result type');
                callback(result);
            });
        };
    })