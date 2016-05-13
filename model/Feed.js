Items = new Mongo.Collection("items");

Items.allow({
    insert: function(userId, doc) {
        // only allow posting if you are logged in and other validations
        return true;
    }
});

if(Meteor.isServer) {
    Meteor.publish('Feed', function publishFunction(itemTypes) {
        return Items.find({type: {$in: itemTypes}}, {sort: {timestamp: -1}});
    });
}