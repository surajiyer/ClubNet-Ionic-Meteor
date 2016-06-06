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

    // Set responses allow rules
    // Only allow posting if the user is logged in and has the correct rights assigned in the database
    Responses.allow({
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
        Meteor.publish('Feed', function (itemTypes, limit) {
            if (!itemTypes) {
                this.ready();
                return;
            }
            check(limit, Number);
            check(itemTypes, [String]);
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
            return Items.insert(newItem);
        },
        /**
         * @summary Function for retrieving a feed item.
         * @param {String} id The String Id of the feed item for which the information needs to be retrieved.
         * @returns {Object} The retrieved feed item
         */
        getFeedItem: function (id) {
            check(id, String);
            return Items.find({_id: id}).fetch()[0];
        },
        /**
         * @summary Function for updating the information of a feed item.
         * @param {Object} updatedItem The updated fields of an existing feed item.
         */
        updateFeedItem: function (updatedItem) {
            // updatedItem.creatorID = Meteor.userId();
            // updatedItem.clubID = Meteor.user().profile.clubID;
            check(updatedItem, Object);
            var id = updatedItem._id;
            delete updatedItem._id;
            Items.update(
                {_id: id},
                {$set: updatedItem}
            );
        },
        /**
         * @summary Function for deleting a feed item.
         * @param {String} itemID The String Id of the feed item that should be deleted.
         * @returns {Object} The deleted feed item
         */
        deleteFeedItem: function (itemID) {
            check(itemID, String);
            return Items.remove({_id: itemID});
        },
        /**
         * @summary Function for retrieving a the type of a feed item.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method getFeedItemType
         * @param {String} itemID The id of the feed item for which the type needs to be retrieved.
         * @returns {String} The type of the feed item
         */
        getFeedItemType: function (itemID) {
            check(itemID, String);
            try {
                return Items.find({_id: itemID}).fetch()[0].type;
            } catch (err) {
                throw new Meteor.Error(err.message);
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
         * @summary Function for retrieving the voting results of a voting feed item.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * The response will consists of an array of number of votes nested within an array with no other data.
         * @method getVotingResults
         * @param {String} itemID The id of the feed item for which the voting results needs to be retrieved.
         * @returns {Array} The voting results
         */
        getVotingResults: function (itemID) {
            check(itemID, String);
            votes = Meteor.call('getResponsesOfOneItem', itemID);
            result = [[0, 0, 0]];
            votes.forEach(function (vote) {
                result[0][Number(vote.value) - 1]++;
            });
            return result;
        },
        /**
         * @summary Function for retrieving a list of trainings.
         * @returns {Array} The trainings
         */
        getTrainings: function () {
            try {
                var obj = HTTP.call("GET", Meteor.absoluteUrl("trainings.json"));
                obj = obj.data;
                for (var training in obj) {
                    obj[training] = obj[training]['training' + (parseInt(training) + 1)];
                }
                return obj;
            } catch (err) {
                throw new Meteor.Error(err.message);
            }
        },
        /**
         * @summary Function for retrieving a training.
         * @param {String} trainingID The String Id of the training which needs to be retrieved.
         * @returns {Object} The training
         */
        getTrainingObj: function (trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            return _.find(trainings, function (obj) {
                return obj.trId == trainingID;
            });
        },
        /**
         * @summary Function for retrieving the exercises of a training.
         * @param {String} trainingID The String Id of the training for which the exercises need to be retrieved.
         * @returns {Array} The exercises of a training
         */
        getExercises: function (trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            trainings = _.find(trainings, function (tr) {
                return tr.trId == trainingID;
            });
            return trainings.exercises;
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
        },
        makeItemSticky: function(itemID) {
            check(itemID, String);
        }
    });
}