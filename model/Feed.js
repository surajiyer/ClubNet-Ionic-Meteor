import * as utils from '/imports/common';
import feedItemSchemas from '/imports/schemas/feedItems';
import responseSchemas from '/imports/schemas/responses';
import {notesSchema} from '/imports/schemas/misc';

Items = new Mongo.Collection("Items");
Responses = new Mongo.Collection("FeedResponses");

/*
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
         * @summary Add a new feed item to the database.
         * @param {Object} newItem The feed item to add.
         * @return {String} The id of the inserted feed item.
         * @throws error if the new feed item does not conform to the corresponding scheme.*/
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
         * @summary Retrieve a feed item.
         * @param {String} itemId The id of the feed item.
         * @return {Object} The document of the feed item to be retrieved.
         * @throws error if the logged in user has no permission to view the specified feed item.
         * @throws error if the input parameters do not have the required type.
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
         * @summary Update the information of a feed item.
         * @param {Object} updatedItem A document object that contains all attributes of the updated feed item..
         * @return None.
         * @throws error if the logged in user has no permission to update the specified feed item
         * @throws error if the 'updatedItem' does not conform to the corresponding feed item scheme.
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
            Items.update(
                {_id: id},
                {$set: updatedItem}
            );
            return Items.find(id).fetch()[0];
        },
        /**
         * @summary Delete a feed item.
         * @param {String} itemId The id of the feed item to be deleted.
         * @return None.
         * @throws error if the logged in user has no permission to delete the specified feed item.
         * @throws error if the input parameters do not have the required type.
         */
        deleteFeedItem: function (itemId) {
            check(itemId, String);
            var item = Items.find(itemId).fetch()[0];
            var loggedIn = Match.test(Meteor.userId(), String);
            var allowed = Meteor.call('checkRights', item.type, 'delete');
            var isCreator = item.creatorID == Meteor.userId();
            if (!(loggedIn && allowed && isCreator)) {
                throw new Meteor.Error(401, 'Not authorized');
            }
            Items.remove({_id: itemId});
            return item;
        },
        /**
         * @summary Retrieve all responses of a feed item.
         * @param {String} itemID The id of the feed item for which the responses need to be retrieved.
         * @return {Object[]} An array that contains the documents of all responses of the specified feed item.
         * @throws error if the input parameters do not have the required type.
         */
        getResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).fetch();
        },
        /**
         * @summary Find the number of responses of a feed item.
         * @param {String} itemID The id of the feed item.
         * @return {Integer} The number of responses of the specified feed item.
         * @throws error if the input parameters do not have the required type.
         */
        getNumberResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).count();
        },
        /**
         * @summary Retrieve the response of the currently logged in user to a feed item.
         * @param {String} itemID The id of the feed item for which the response needs to be retrieved.
         * @return {Object} The document of the response to the specified feed item.
         * @throws error if the input parameters do not have the required type.
         */
        getResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            return Responses.find({itemID: itemID, userID: Meteor.userId()}).fetch()[0];
        },
        /**
         * @summary Delete the response of the currently logged in user to a feed item.
         * @param {String} itemID The id of the feed item for which response needs to be deleted.
         * @return None.
         * @throws error if the input parameters do not have the required type.
         */
        deleteResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            Responses.remove({itemID: itemID, userID: Meteor.userId()});
        },
        /**
         * @summary Function for retrieving the responses to feed items of a certain type.
         * @param {String} itemType The type of the feed items for which the responses needs to be retrieved.
         * @return {Object[]} An array that contains all the responses to feed items of the specified type.
         * @throws error if the input parameters do not have the required type.
         */
        getResponsesOfItemType: function (itemType) {
            check(itemType, String);
            return Responses.find({itemType: itemType}).fetch();
        },
        /**
         * @summary Add a new response to a feed item.
         * @param {String} itemID The id of the feed item.
         * @param {String} itemType The type of the feed item.
         * @param {String} value The value of the response.
         * @return {String} The id of the inserted response.
         * @throws error if the input parameters do not have the required type.
         */
        putResponse: function (itemID, itemType, value) {
            check(itemID, String);
            check(itemType, String);
            check(value, String);

            // Validation checks
            var item = Items.find(itemID).fetch()[0];
            if(!item || !item.type) {
                throw new Meteor.Error(404, 'Item not found');
            }

            var response = {
                userID: Meteor.userId(),
                itemID: itemID,
                itemType: item.type,
                value: value
            };
            check(response, Responses.simpleSchema({itemType: itemType}));
            return Responses.insert(response);
        },
        /**
         * @summary Get the number of all feed items that could be viewed by the logged in user.
         * @return {Integer} The number of feed items that could be viewed by the logged in user.
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
         * @summary Add a new note to a feed item.
         * @param{Object} newNote A document object that contains all information of the note that needs to be added.
         * @return None.
         * @throws error if the 'newNote' does not conform to the corresponding database scheme.
         */
        addNote: function (newNote) {
            check(newNote, notesSchema);
            Meteor.users.update(
                {_id: Meteor.userId()},
                {$push: {'notes': newNote}}
            );
        },
        /**
         * @summary Update the context of a note.
         * @param {Object} newNote A document object that contains all information of the updated note.
         * @return None.
         * @throws error if the 'newNote' does not conform to the corresponding database scheme.
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