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
         * @summary Add a new feed item to the database. This function should be called when a new feed item is created.
         * All the information of the created feed item should be passed to this function. Only after this function is called,
         *  the new feed item is created.
         * @param {Object} newItem The new feed item to add. It should contain all the necessary information of a new feed item.
         * Feed items of different types will require different information. The details of the required attributes can be
         * found in the database scheme.
         * @return {String} The id of the inserted feed item. This id is generated automatically by the MongoDB and uniquely
         * identify the newly created feed item.
         * @throws error if the new feed item does not conform to the corresponding scheme.
         * @throws error if the logged in user is not allowed to create the feed item of the specified type.
         * @after After a new feed item is created, a push notification will be sent to the users who subscribed to the
         * specified feed item type.*/


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
         * @summary Retrieve all the information of feed item specified by the item id. This function checks whether
         * the logged in user has the permission to view the specified feed item before returning it. If not, an error is thrown.
         * @param {String} itemId The id of the feed item to be retrieved.
         * @return {Object} The document of the feed item to be retrieved. It contains all the attributes of the specified
         * feed item stored in the database.
         * @throws error if the logged in user has no permission to view the specified feed item.
         * @throws error if the input parameter does not have the required type. The itemId must be a String object.
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
         * @summary Update the information of a feed item. All information of the updated feed item should be passed to
         * this function, including the feed item ID. This function checks whether the logged in user has the permission
         * to update the information of the specified feed item.
         * @param {Object} updatedItem A document object that contains all attributes of the updated feed item.
         * @return None.
         * @throws error if the logged in user has no permission to update the specified feed item.
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
         * @summary Delete a feed item that is specified with the id. This function checks whether the logged in user has
         *  the permission to delete the specified feed item.
         * @param {String} itemId The id of the feed item to be deleted.
         * @return None.
         * @throws error if the logged in user has no permission to delete the specified feed item.
         * @throws error if the input parameters do not have the required type.
         * @after The specified feed item will be permanently deleted from the database.
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
         * @summary Retrieve all responses of a feed item specified by the id.
         * @param {String} itemID The id of the feed item for which the responses need to be retrieved.
         * @return {Object[]} An array that contains the documents of all responses of the specified feed item.
         * @throws error if the input parameter does not have the required type. The itemID must be a String object.
         */
        getResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).fetch();
        },
        /**
         * @summary Find the number of responses of a feed item specified by the id. This function returns the count of
         *  the responses from all users to the specified feed item.
         * @param {String} itemID The id of the feed item for which the number of responses should be returned.
         * @return {Integer} The number of responses from all users to the specified feed item.
         * @throws error if the input parameters do not have the required type. The itemID must be a String object.
         */
        getNumberResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).count();
        },
        /**
         * @summary Retrieve the response of the currently logged in user to a feed item. The feed item is specified by
         * the id.
         * @param {String} itemID The id of the feed item for which the response needs to be retrieved.
         * @return {Object} The document containing all the information of the response to the specified feed item.
         * @throws error if the input parameters do not have the required type. The itemID must be a String object.
         */
        getResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            return Responses.find({itemID: itemID, userID: Meteor.userId()}).fetch()[0];
        },
        /**
         * @summary Delete the response of the currently logged in user to a feed item. The feed item is specified by
         *  the id. The response will be permanently removed from the database once this function is called.
         * @param {String} itemID The id of the feed item for which response needs to be deleted.
         * @return None.
         * @throws error if the input parameters do not have the required type. The itemID must be a String object.
         */
        deleteResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            Responses.remove({itemID: itemID, userID: Meteor.userId()});
        },

        getResponsesOfItemType: function (itemType) {
            check(itemType, String);
            return Responses.find({itemType: itemType}).fetch();
        },
        /**
         * @summary Add a new response to a feed item specified by the id. This function should be called to register
         * a new response to any feed item. If the specified feed item does not exist in the database, an error is thrown.
         * @param {String} itemID The id of the feed item.
         * @param {String} itemType The type of the feed item.
         * @param {String} value The value of the response.
         * @return {String} The id of the inserted response. This id is automatically generated by MongoDB.
         * @throws error if the input parameters do not have the required type. All input parameters must be String objects.
         * @throws error if the specified feed item does not exist in the database.
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
         * @summary Get the number of all feed items that could be viewed by the logged in user. A use can only view
         * feed item that is posted within his club or teams.
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
         * @summary Add a new note to a feed item. A document that contains all information of a note, including 
         * the creator id, feed item id and content, should be passed to this function.
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
         * @summary Update the context of a note. A document that contains all information of a note, including the creator
         *  id, feed item id and updated content, should be passed to this function.
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