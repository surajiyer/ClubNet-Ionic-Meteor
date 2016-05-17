if(Meteor.isServer) {
    AMx = new Mongo.Collection("accessControl");
    // Meteor.publish('accessControl', function() {
    //     return AMx.find({});
    // });

    Meteor.methods({
        /**
         * Check user permissions (Access control).
         * @param role the type of user eg.: coach, player...
         * @param itemType the item for which permission is being requested
         * @param permission the type of permission being requested for the item: create, view, edit or delete.
         * @returns true if permitted or false if denied
         */
        checkRights: function(role, itemType, permission) {
            if(typeof role !== 'string')
                throw new Meteor.Error('Role must be a string');
            if(typeof itemType !== 'string')
                throw new Meteor.Error('Item type must be a string');
            if(typeof permission !== 'string')
                throw new Meteor.Error('Permission required must be a string');

            var doc = AMx.findOne(
                {'_id': role},
                {fields: {'items': {$elemMatch: {'_id': itemType}}}}
            );

            return doc.items[0].permissions[permission];
        }
    });
}