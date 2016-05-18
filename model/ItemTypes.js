if (Meteor.isServer) {
    TypesCollection = new Mongo.Collection("ItemTypes");

    Meteor.publish('ItemTypes', function () {
        return TypesCollection.find({});
    });

    /**
     * Cannot return a cursor in Meteor.methods, only EJON-able values.
     */
    Meteor.methods({
        ItemTypes: function () {
            return TypesCollection.find({}).fetch();
        }
    });
}