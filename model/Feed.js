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
        Meteor.publish('Feed', function (itemTypes) {
            if (!itemTypes) {
                this.ready();
                return;
            }
            return Items.find({type: {$in: itemTypes}}, {$sort: {sticky: -1, createdAt: -1}});
        });
    }
});

if (Meteor.isServer) {
    Meteor.methods({
        addFeedItem: function (newItem) {
            newItem.creatorID = Meteor.userId();
            Items.insert(newItem);
        },
        getFeedItemByCreatedAt: function (date) {
            try {
                return Items.find({createdAt: date}).fetch();
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
        },
        updateFeedItem: function (itemID, newInfo) {
            Items.update(
                {_id: itemID},
                {$set: newInfo},
                {bypassCollection2: true}
            );
        },
        deleteFeedItem: function (itemID) {
            Items.remove({_id: itemID});
        },
        getItemType: function (itemID) {
            try {
                return Items.find({_id: itemID}).fetch()[0].type;
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
        },
        getResponsesOfOneItem: function (itemID) {
            return Responses.find({itemID: itemID}).fetch();
        },
        getResponse: function (itemID) {
            var response = Responses.find({itemID: itemID, userID: this.userId}).fetch();
            if (response[0]) {
                return response[0].value;
            } else {
                return 0;
            }
        },
        deleteResponse: function (response) {
            Responses.remove({itemID: response.itemID, responsorID: response.responsorID});
        },
        getResponsesOfItemType: function (itemType) {
            return Responses.find({itemType: itemType}).fetch();
        },
        putResponse: function (itemID, userID, itemType, value) {
            Responses.insert({itemID: itemID, userID: userID, itemType: itemType, value: value});
        },
        getVotingResults: function (itemID) {
            votes = Responses.find({itemID: itemID});
            result = [[0, 0, 0]];
            votes.forEach(function (vote) {
                result[0][vote.value - 1]++;
            });
            return result;
        },
    })
}