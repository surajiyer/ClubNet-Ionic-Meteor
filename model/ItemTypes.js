TypesCollection = new Mongo.Collection("ItemTypes");

if (Meteor.isServer) {
    /**
     * Cannot return a cursor in Meteor.methods, only EJON-able values.
     */
    Meteor.publish('ItemTypes', function () {
        return TypesCollection.find({});
    });
}