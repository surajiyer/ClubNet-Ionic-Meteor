import {isAdmin} from '/imports/common';
import {accessControlSchema} from '/imports/schemas/misc';

AMx = new Mongo.Collection("AccessControl");

Meteor.startup(function () {
    AMx.attachSchema(accessControlSchema);
    console.log(process.env.MONGO_URL);
});

Meteor.methods({
    /**
     * Check user permissions (Access control).
     * @param itemType the item for which permission is being requested
     * @param permission the type of permission being requested for the item: create, view, edit or delete.
     * @returns true if permitted or false if denied
     */
    checkRights: function (itemType, permission) {
        check(itemType, String);
        check(permission, String);

        var doc = AMx.findOne(
            {'_id': Meteor.call('getUserType')},
            {fields: {'items': {$elemMatch: {'_id': itemType}}}}
        );

        if(!doc.items) {
            throw new Meteor.Error('No such permission defined');
        }

        return doc.items[0].permissions[permission];
    },
    setPermissions: function (newAccess) {
        check(this.userId, Match.Where(isAdmin));
        check(newAccess, accessControlSchema);
        AMx.insert(newAccess, function (err) {
            if (err) throw new Meteor.Error(err.error);
        });
    }
});