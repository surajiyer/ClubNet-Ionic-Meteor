import {isValidType} from '/imports/common';
import feedItemSchemas from '/imports/schemas/feedItems';
import responseSchemas from '/imports/schemas/responses';

Items = new Mongo.Collection("Items");
Responses = new Mongo.Collection("FeedResponses");

Meteor.startup(function () {
    Items.allow({
        // only allow posting if you are logged in and other validations
        insert: function (userId, doc) {
            var loggedIn = !!userId;
            var allowed = Meteor.call('checkRights', doc.type, 'create');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        },
        update: function (userId, doc) {
            var loggedIn = !!userId;
            var allowed = Meteor.call('checkRights', doc.type, 'edit');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        },
        remove: function (userId, doc) {
            var loggedIn = !!userId;
            var allowed = Meteor.call('checkRights', doc.type, 'delete');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        }
    });

    Responses.allow({
        // only allow responses if you are logged in and other validations
        insert: function (userId, doc) {
            var loggedIn = !!userId;
            var allowed = Meteor.call('checkRights', doc.type, 'create');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        },
        update: function (userId, doc) {
            var loggedIn = !!userId;
            var allowed = Meteor.call('checkRights', doc.type, 'edit');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        },
        remove: function (userId, doc) {
            var loggedIn = !!userId;
            var allowed = Meteor.call('checkRights', doc.type, 'delete');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        }
    });

    if (Meteor.isServer) {
        Meteor.publish('Feed', function (itemTypes) {
            if (!itemTypes) {
                this.ready();
                return;
            }
            check(itemTypes, [String]);
            return Items.find({type: {$in: itemTypes}}, {sort: {createdAt: -1}});
        });
    }

    // Attach feed items schemas
    _.each(feedItemSchemas, function (schema, itemType) {
        Items.attachSchema(schema, {selector: {type: itemType}});
    });

    // Attach feed item responses schemas
    _.each(responseSchemas, function (schema, itemType) {
        Responses.attachSchema(schema, {selector: {itemType: itemType}});
    });
});

if (Meteor.isServer) {
    Meteor.methods({
        addFeedItem: function (newItem) {
            newItem.creatorID = this.userId;
            newItem.clubID = Meteor.user().profile.clubID;
            check(newItem, feedItemSchemas[newItem.type]);
            Items.insert(newItem);
        },
        updateFeedItem: function (itemID, newInfo) {
            check(itemID, String);
            // TODO: fix checking newInfo
            check(newInfo, Object);
            Items.update(
                {_id: itemID},
                {$set: newInfo}
            );
        },
        deleteFeedItem: function (itemID) {
            check(itemID, String);
            Items.remove({_id: itemID});
        },
        getFeedItemType: function (itemID) {
            check(itemID, String);
            try {
                return Items.find({_id: itemID}).fetch()[0].type;
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
        },
        getResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).fetch();
        },
        getResponse: function (itemID) {
            check(itemID, String);
            check(this.userId, String);
            var response = Responses.find({itemID: itemID, userID: this.userId}).fetch()[0];
            if (response) return response.value;
        },
        deleteResponse: function (itemID) {
            check(itemID, String);
            check(this.userId, String);
            Responses.remove({itemID: itemID, userID: this.userId});
        },
        getResponsesOfItemType: function (itemType) {
            check(itemType, Match.Where(isValidType));
            return Responses.find({itemType: itemType}).fetch();
        },
        putResponse: function (itemID, itemType, value) {
            check(itemID, String);
            check(this.userId, String);
            check(itemType, Match.Where(isValidType));
            check(value, String);
            Responses.insert({itemID: itemID, userID: this.userId, itemType: itemType, value: value});
        },
        getVotingResults: function (itemID) {
            check(itemID, String);
            votes = Responses.find({itemID: itemID});
            result = [[0, 0, 0]];
            votes.forEach(function (vote) {
                result[0][vote.value - 1]++;
            });
            return result;
        },
    })
}