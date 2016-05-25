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
            return Items.find({type: {$in: itemTypes}}, {sort: {sticky: -1, createdAt: -1}});
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
            newItem.creatorID = Meteor.userId();
            newItem.clubID = Meteor.user().profile.clubID;
            check(newItem, Items.simpleSchema({type: newItem.type}));
            return Items.insert(newItem);
        },
        getFeedItem: function (id) {
            check(id, String);
            return result = Items.find({ _id : id}).fetch()[0];
        },
        updateFeedItem: function (updatedItem) {
            id = updatedItem._id;
            delete updatedItem._id;
            check(updatedItem, Items.simpleSchema({type: updatedItem.type}));
            Items.update(
                {_id: id},
                {$set: updatedItem}
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
            check(Meteor.userId(), String);
            return Responses.find({itemID: itemID, userID: Meteor.userId()}).fetch()[0];
        },
        deleteResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            Responses.remove({itemID: itemID, userID: Meteor.userId()});
        },
        getResponsesOfItemType: function (itemType) {
            check(itemType, String);
            return Responses.find({itemType: itemType}).fetch();
        },
        putResponse: function (itemID, itemType, value) {
            check(itemID, String);
            check(itemType, String);
            check(value, String);
            response = {
                userID: Meteor.userId(),
                itemID: itemID,
                itemType: itemType,
                value: value
            }
            check(response, Responses.simpleSchema({itemType: itemType}));
            return Responses.insert(response);
        },
        getVotingResults: function (itemID) {
            check(itemID, String);
            votes = Responses.find({itemID: itemID}).fetch();
            result = [[0, 0, 0]];
            votes.forEach(function (vote) {
                result[0][Number(vote.value)]++;
            });
            return result;
        }
    })
}