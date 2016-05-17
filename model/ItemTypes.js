if(Meteor.isServer) {
    TypesCollection = new Mongo.Collection("ItemTypes");

    Meteor.publish();

    /**
     * Cannot return a cursor in Meteor.methods, only EJON-able values.
     */
    Meteor.methods({
        ItemTypes: function() {
            return TypesCollection.find({}).fetch();
        }
    });
}