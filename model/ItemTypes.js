if(Meteor.isServer) {
    TypesCollection = new Mongo.Collection("ItemTypes");

    /**
     * Cannot return a cursor in Meteor.methods, only EJON-able values.
     */
    Meteor.methods({
        ItemTypes: function() {
            return TypesCollection.find({}).fetch();
        }
    });
}