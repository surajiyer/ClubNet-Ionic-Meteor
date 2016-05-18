import feedItemSchemas from '/imports/schemas/feedItems';
import responseSchemas from '/imports/schemas/responses';

Items = new Mongo.Collection("Items");
Responses = new Mongo.Collection("FeedResponses");

Meteor.startup(function () {
    // _.each(feedItemSchemas, function (schema) {
    //     Items.attachSchema(feedItemSchemas[schema], {selector: {type: schema}});
    // });
    //
    // _.each(responseSchemas, function (schema) {
    //     Responses.attachSchema(responseSchemas[schema], {selector: {type: schema}});
    // });

    Items.allow({
        insert: function (userId, doc) {
            // only allow posting if you are logged in and other validations
            if (!userId)
                throw new Meteor.Error('Not logged in.');
            return true;
        }
    });

    if (Meteor.isServer) {
        Meteor.publish('Feed', function(itemTypes) {
            return Items.find({type: {$in: itemTypes}}, {sort: {timestamp: -1}});
        });

    }
});

if (Meteor.isServer) {
    Meteor.methods({
        getItemType: function (itemID) {
            try {
                return Items.find({_id: itemID}).fetch()[0].type;
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
        },
        addResponse: function (newResponse) {
            Meteor.call('getItemType', newResponse._id, function (err, result) {
                if (err) throw new Meteor.Error(err.reason);
                if(result == 'Voting')
                    Responses.insert(newResponse);
                console.log("added new response");
            });
        }
    })
}