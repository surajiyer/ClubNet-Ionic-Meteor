AMx = new Mongo.Collection("accessControl");

if(Meteor.isServer) {
    Meteor.publish('accessControl', function publishFunction() {
        return AMx.find({});
    });

    Meteor.methods({
        checkRights: function(role, itemType) {
            var doc = AMx.findOne(
                {'_id': role},
                {fields: {'items': {$elemMatch: {'_id': itemType}}}}
            );
            return doc;
        }
    });
}