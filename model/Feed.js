import feedItemSchemas from '/imports/schemas/feedItems';
import responseSchemas from '/imports/schemas/responses';

items = new Mongo.Collection("Items");
Responses = new Mongo.Collection("FeedResponses");

Meteor.startup(function () {
    _.each(feedItemSchemas, function (schema) {
        items.attachSchema(feedItemSchemas[schema], {selector: {itemType: schema}});
    });

    _.each(responseSchemas, function (schema) {
        Responses.attachSchema(responseSchemas[schema], {selector: {itemType: schema}});
    });

    items.allow({
        insert: function (userId, doc) {
            // only allow posting if you are logged in and other validations
            if (!userId)
                throw new Meteor.Error('Not logged in.');
            return true;
        }
    });
});

if (Meteor.isServer) {
    // Meteor.publish('Feed', function publishFunction(itemTypes) {
    //     return items.find({type: {$in: itemTypes}}, {sort: {timestamp: -1}});
    // });

    Meteor.publish('Feed', function () {
        return items.find({}, {sort: {timestamp: -1}});
    });

    Meteor.methods({
        addResponse: function (newResponse) {
            try {
                newResponse['itemType'] = Meteor.call('getTypeItem', newResponse._id);
                Responses.insert(newResponse);
                console.log("added new response");
            } catch (err) {
                console.log("addResponse():" + err);
            }
        },
        getItemType: function (itemID) {
            try {
                return items.find({_id: itemID}).fetch()[0].itemType;
            } catch (err) {
                throw new Meteor.Error(err.error);
            }
        }
    })
}