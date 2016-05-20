TypesCollection = new Mongo.Collection("ItemTypes");

TypesCollection.deny({
    insert: function () {
        return false;
    },
    update: function () {
        return false;
    },
    remove: function () {
        return false;
    }
});

if (Meteor.isServer) {
    /**
     * Cannot return a cursor in Meteor.methods, only EJON-able values.
     */
    Meteor.publish('ItemTypes', function () {
        return TypesCollection.find({});
    });

    Meteor.methods({
        getItemTypes: function () {
            return TypesCollection.find().fetch()[0];
        },
    });
}