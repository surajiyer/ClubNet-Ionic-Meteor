TypesCollection = new Mongo.Collection("typesCollection");

if(Meteor.isServer) {
    Meteor.publish('typesCollection', function publishFunction() {
        return TypesCollection.find({});
    });
}