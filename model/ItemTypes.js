TypesCollection = new Mongo.Collection("ItemTypes");

if(Meteor.isServer) {
    Meteor.publish('ItemTypes', function publishFunction() {
        return TypesCollection.find({});
    });
}

TypesCollection.deny({
    update: function(userId, doc, fields, modifier) {
        return false;
    },
    insert: function(userId, doc) {
        return false;
    },
    remove: function(userId, doc) {
        return false;
    }
});