import * as utils from '/imports/common';
import feedItemSchemas from '/imports/schemas/feedItems';
import responseSchemas from '/imports/schemas/responses';
import {notesSchema} from '/imports/schemas/misc';
import {HTTP} from 'meteor/http'

Items = new Mongo.Collection("Items");
Responses = new Mongo.Collection("FeedResponses");

/**
 * @summary Rules and Methods for the items collection.
 * On startup it will set the deny and allow rules, publish the item data and attach the feedItemSchema and responseSchema
 * @param {Function} Function to execute on startup.
 */
Meteor.startup(function () {
    // Set items allow rules
    // Only allow posting if the user is logged in and has the correct rights assigned in the database
    Items.allow({
        insert: function (userId, doc) {
            var loggedIn = !!userId && userId == Meteor.userId();
            var allowed = Meteor.call('checkRights', doc.type, 'create');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        },
        update: function (userId, doc) {
            var loggedIn = !!userId && userId == Meteor.userId();
            var allowed = Meteor.call('checkRights', doc.type, 'edit');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        },
        remove: function (userId, doc) {
            var loggedIn = !!userId && userId == Meteor.userId();
            var allowed = Meteor.call('checkRights', doc.type, 'delete');
            var isCreator = userId == doc.creatorID;
            return loggedIn && allowed && isCreator;
        }
    });

    // Set responses allow rules
    // Only allow posting if the user is logged in and has the correct rights assigned in the database
    // Responses.allow({
    //     insert: function (userId, doc) {
    //         var loggedIn = !!userId;
    //         var allowed = Meteor.call('checkRights', doc.type, 'create');
    //         var isCreator = userId == doc.creatorID;
    //         return loggedIn && allowed && isCreator;
    //     },
    //     update: function (userId, doc) {
    //         var loggedIn = !!userId;
    //         var allowed = Meteor.call('checkRights', doc.type, 'edit');
    //         var isCreator = userId == doc.creatorID;
    //         return loggedIn && allowed && isCreator;
    //     },
    //     remove: function (userId, doc) {
    //         var loggedIn = !!userId;
    //         var allowed = Meteor.call('checkRights', doc.type, 'delete');
    //         var isCreator = userId == doc.creatorID;
    //         return loggedIn && allowed && isCreator;
    //     }
    // });

    if (Meteor.isServer) {
        Meteor.publish('Feed', function (itemTypes, limit) {
            check(itemTypes, [String]);
            check(limit, Number);
            if (!itemTypes || !this.userId) return this.ready();
            var teamLevelSelector = [{teamID: {$exists: false}}];
            var teamID = utils.getUserTeamID(this.userId);
            if (teamID) {
                teamLevelSelector.push({teamID: {$exists: true, $eq: teamID}});
            }
            var clubID = utils.getUserClubID(this.userId);
            return Items.find({
                type: {$in: itemTypes},
                clubID: clubID,
                $or: teamLevelSelector
            }, {
                sort: {
                    sticky: -1,
                    createdAt: -1
                },
                limit: limit
            });
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
        /**
         * @summary Function for adding a new feed item to the collection
         * It will check whether or not the new feed item adheres to the schema.
         * If so, it will add the feed item to the collection.
         * @method addFeedItem
         * @param {Object} newItem The feed item to add.
         * @returns {String} The ObjectID of the inserted feed item
         */
        addFeedItem: function (newItem) {
            check(newItem, Object);
            var loggedIn = Match.test(Meteor.userId(), String);
            var allowed = Meteor.call('checkRights', newItem.type, 'create');
            if (!(loggedIn && allowed)) {
                throw new Meteor.Error(401, 'Not authorized');
            }
            var itemId = Items.insert(newItem);
            if (itemId) {
                var title, text;
                switch (newItem.type) {
                    case "Voting":
                        title = 'New voting!';
                        text = 'Vote for the exercise you like.';
                        Meteor.call('sendTeamNotification', newItem.type, title, text);
                        break;
                    case "Form":
                        title = 'New practicality!';
                        text = 'React on new practicality.';
                        Meteor.call('sendTeamNotification', newItem.type, title, text);
                        break;
                    case "Heroes":
                        title = 'New Hero!';
                        text = 'Check out a new hero of the week.';
                        Meteor.call('sendClubNotification', newItem.type, title, text);
                        break;
                    case "Sponsoring":
                        title = 'New sponsoring event!';
                        text = 'Contribute to a new sponsoring event.';
                        Meteor.call('sendClubNotification', newItem.type, title, text);
                        break;
                }
            }
            return itemId;
        },
        /**
         * @summary Function for retrieving a feed item.
         * @param {String} itemId The String Id of the feed item for which the information needs to be retrieved.
         * @returns {Object} The retrieved feed item
         */
        getFeedItem: function (itemId) {
            check(itemId, String);
            var item = Items.find({_id: itemId}).fetch()[0];
            var loggedIn = Match.test(Meteor.userId(), String);
            var allowed = Meteor.call('checkRights', item.type, 'view');
            if (!(loggedIn && allowed)) {
                throw new Meteor.Error(401, 'Not authorized');
            }
            var succesCheck = Meteor.call('checkRepeatInterval', itemId);
            return item;
        },
        /**
         * @summary Function for updating the information of a feed item.
         * @param {Object} updatedItem The updated fields of an existing feed item.
         */
        updateFeedItem: function (updatedItem) {
            check(updatedItem, Object);
            var loggedIn = Match.test(Meteor.userId(), String);
            var allowed = Meteor.call('checkRights', updatedItem.type, 'edit');
            var isCreator = updatedItem.creatorID == Meteor.userId();
            if (!(loggedIn && allowed && isCreator)) {
                throw new Meteor.Error(401, 'Not authorized');
            }
            var id = updatedItem._id;
            delete updatedItem._id;
            try {
                Items.update(
                    {_id: id},
                    {$set: updatedItem}
                );
                return Items.find(id).fetch()[0];
            } catch (e) {
            }
        },
        /**
         * @summary Function for deleting a feed item.
         * @param {String} itemId The String Id of the feed item that should be deleted.
         * @returns {Object} The deleted feed item
         */
        deleteFeedItem: function (itemId) {
            check(itemId, String);
            var item = Items.find(itemId).fetch()[0];
            var loggedIn = Match.test(Meteor.userId(), String);
            var allowed = Meteor.call('checkRights', item.type, 'delete');
            var isCreator = item.creatorID == Meteor.userId();
            if(!(loggedIn && allowed && isCreator)) {
                throw new Meteor.Error(401, 'Not authorized');
            }
            try {
                Items.remove({_id: itemId});
                return item;
            } catch (e) {
            }
        },
        /**
         * @summary Function for retrieving responses of a feed item.
         * @param {String} itemID The id of the feed item for which the responses need to be retrieved.
         * @returns {Array} The responses of the feed item
         */
        getResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).fetch();
        },
        getNumberResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).count();
        },
        /**
         * @summary Function for retrieving the response of the currently logged in user to a feed item.
         * @param {String} itemID The id of the feed item for which the response needs to be retrieved.
         * @returns {Object} The response
         */
        getResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            return Responses.find({itemID: itemID, userID: Meteor.userId()}).fetch()[0];
        },
        /**
         * @summary Function for deleting a response of the currently logged in user to a feed item.
         * @param {String} itemID The id of the feed item for which response needs to be deleted.
         */
        deleteResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            Responses.remove({itemID: itemID, userID: Meteor.userId()});
        },
        /**
         * @summary Function for retrieving the responses to feed items of a certain type.
         * @param {String} itemType The type of the feed items for which the responses needs to be retrieved.
         * @returns {Array} The responses
         */
        getResponsesOfItemType: function (itemType) {
            check(itemType, String);
            return Responses.find({itemType: itemType}).fetch();
        },
        /**
         * @summary Function for posting a response to a feed item.
         * @param {String} itemID The String Id of the feed item for which the response needs to be added.
         * @param {String} itemType The type of the feed item for which the response needs to be added.
         * @param {String} value The value of the response.
         * @returns {String} The Id of the inserted response
         */
        putResponse: function (itemID, itemType, value) {
            check(itemID, String);
            check(itemType, String);
            check(value, String);
            var response = {
                userID: Meteor.userId(),
                itemID: itemID,
                itemType: itemType,
                value: value
            };
            check(response, Responses.simpleSchema({itemType: itemType}));
            return Responses.insert(response);
        },
        /**
         * @summary Function for retrieving the number of all items that could be retrieved
         * @returns {Number} The number of feed items that could be retrieved for an user
         */
        getItemsCount: function () {
            var clubID = Meteor.user().profile.clubID;
            var teamID = Meteor.user().profile.teamID;
            var teamLevelSelector = [{teamID: {$exists: false}}];
            if (teamID) {
                teamLevelSelector.push({teamID: {$exists: true, $eq: teamID}});
            }
            return Items.find({clubID: clubID, $or: teamLevelSelector}).count();
        },
        /**
         * @summary Function for adding a note.
         * It will first check whether the parameters adhere to the schema.
         * If so, it will store the note as a part of the user.
         * @method addNote
         * @param newNote The note that needs to be added.
         */
        addNote: function (newNote) {
            check(newNote, notesSchema);
            Meteor.users.update(
                {_id: Meteor.userId()},
                {$push: {'notes': newNote}}
            );
        },
        /**
         * @summary Function for updating a note.
         * It will first check whether the parameters adhere to the schema.
         * If so, it will find the note and update the text.
         * @method updateNote
         * @param newNote The note that needs to be updated, but with different text.
         */
        updateNote: function (newNote) {
            check(newNote, notesSchema);
            Meteor.users.update(
                {
                    _id: Meteor.userId(),
                    notes: {$elemMatch: {itemID: newNote.itemID}}
                },
                {$set: {"notes.$.text": newNote.text}}
            );
        }
    });
}