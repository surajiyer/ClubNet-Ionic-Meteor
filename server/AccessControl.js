import {isAdmin} from '/imports/common';
import {accessControlSchema} from '/imports/schemas/misc';
import {Meteor} from 'meteor/meteor';

AMx = new Mongo.Collection("AccessControl");

Meteor.startup(function () {
    AMx.attachSchema(accessControlSchema);
});

if(Meteor.isServer) {
    Meteor.methods({
        /**
         * @summary Check whether the logged in user is allowed to perform an operation.
         * @param{String} itemType The item for which permission is being requested
         * @param{String} permission The type of permission being requested for the item: create, view, edit or delete.
         * @return True if the operation is permitted. Otherwise false.
         * @throws error if the input parameters do not have the required type.
         * @throws error if the specified permission is not defined.
         */
        checkRights: function (itemType, permission) {
            check(itemType, String);
            check(permission, String);
            check(Meteor.user(), Object);

            var doc = AMx.findOne(
                {'_id': Meteor.user().profile.type},
                {fields: {'items': {$elemMatch: {'_id': itemType}}}}
            );

            if (!doc.items) {
                throw new Meteor.Error('No such permission defined');
            }
            
            return doc.items[0].permissions[permission];
        },
        /**
         * @summary Insert a new set of permissions for a user type.
         * @param{Object} newAccess A document object that contains all attributes required in the 'accessControlSchema' .
         * @return{String} The id of the inserted document of the permissions.
         * @throws error if 'newAccess' does not conform to the database scheme.
         * @throws error if the logged in user is not allowed to set permissions.
         */
        setPermissions: function (newAccess) {
            check(Meteor.userId(), Match.Where(isAdmin));
            check(newAccess, accessControlSchema);
            return AMx.insert(newAccess, function (err) {
                if (err) throw new Meteor.Error(err.error);
            });
        }
    });
}