Meteor.publish('allFeed', function publishFunction(itemTypes) {
    return Items.find({type: {$in: itemTypes}}, {sort: {timestamp: -1}});
});

Meteor.publish('typesCollection', function publishFunction() {
    return TypesCollection.find({});
});