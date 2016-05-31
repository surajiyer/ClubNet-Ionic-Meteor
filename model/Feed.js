import * as utils from '/imports/common';
import feedItemSchemas from '/imports/schemas/feedItems';
import responseSchemas from '/imports/schemas/responses';
import { HTTP } from 'meteor/http'

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
        Meteor.publish('Feed', function (itemTypes) {
            if (!itemTypes) {
                this.ready();
                return;
            }
            check(itemTypes, [String]);
            // return Items.find({
            //     clubID: utils.getUserClubID(this.userId), 
            //     type: {$in: itemTypes}
            // }, {sort: {sticky: -1, createdAt: -1}});
            var teamID = Meteor.users.find({_id: this.userId}).fetch()[0].profile.teamID;
            return Items.find({type: {$in: itemTypes}, teamID: teamID}, {sort: {sticky: -1, createdAt: -1}});
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
         * @returns {WriteResult} The result of the insert action
         */
        addFeedItem: function (newItem) {
            newItem.creatorID = Meteor.userId();
            newItem.clubID = Meteor.user().profile.clubID;
            check(newItem, Items.simpleSchema({type: newItem.type}));
            return Items.insert(newItem);
        },
        /**
         * @summary Function for retrieving a feed item.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method getFeedItem
         * @param {String} id The id of the feed item for which the information needs to be retrieved.
         * @returns {Object} The retrieved feed item
         */
        getFeedItem: function (id) {
            check(id, String);
            return result = Items.find({_id: id}).fetch()[0];
        },
        /**
         * @summary Function for updating the information of a feed item.
         * It will first check whether the parameters are valid.
         * If so, it will update the feed item with the new information.
         * @method updateFeedItem
         * @param {Object} updatedItem The new data of the feed item.
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
         * It will first check whether the parameters are valid.
         * If so, it will delete the feed item.
         * @method deleteFeedItem
         * @param {String} itemID The feed item that should be deleted.
         */
        deleteFeedItem: function (itemID) {
            check(itemID, String);
            Items.remove({_id: itemID});
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
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method getResponsesOfOnItem
         * @param {String} itemID The id of the feed item for which the responses need to be retrieved.
         * @returns {Array} The responses of the feed item
         */
        getResponsesOfOneItem: function (itemID) {
            check(itemID, String);
            return Responses.find({itemID: itemID}).fetch();
        },
        /**
         * @summary Function for retrieving the response of the currently logged in user to a feed item.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method getResponse
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
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method deleteResponse
         * @param {String} itemID The id of the feed item for which response needs to be deleted.
         */
        deleteResponse: function (itemID) {
            check(itemID, String);
            check(Meteor.userId(), String);
            Responses.remove({itemID: itemID, userID: Meteor.userId()});
        },
        /**
         * @summary Function for retrieving the responses to feed items of a certain type.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method getResponsesOfItemType
         * @param {String} itemType The type of the feed items for which the responses needs to be retrieved.
         * @returns {Array} The responses
         */
        getResponsesOfItemType: function (itemType) {
            check(itemType, String);
            return Responses.find({itemType: itemType}).fetch();
        },
        /**
         * @summary Function for posting a response to a feed item.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method putResponse
         * @param {String} itemID The id of the feed item for which the response needs to be added.
         * @param {String} itemType The type of the feed item for which the response needs to be added.
         * @param {String} value The value of the response.
         * @returns {WriteResult} The result of the insert action
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
                result[0][Number(vote.value)-1]++;
            });
            return result;
        },
        getBettingResults: function (itemID) {
        },
        /**
         * @summary Function for retrieving a list of trainings.
         * @method getTrainings
         * @returns {Array} The trainings
         */
        getTrainings: function() {
            try {
                var obj = HTTP.call("GET", Meteor.absoluteUrl("trainings.json"));
                obj = obj.data;
                for (var training in obj) {
                    obj[training] = obj[training]['training'+(parseInt(training)+1)];
                }
                return obj;
            } catch(err) {
                throw new Meteor.Error(err.message);
            }
        },
        /**
         * @summary Function for retrieving a training.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method getTrainingObj
         * @param {String} trainingID The id of the training which needs to be retrieved.
         * @returns {Object} The training
         */
        getTrainingObj: function(trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            return _.find(trainings, function(obj){ return obj.trId == trainingID; });
        },
        /**
         * @summary Function for retrieving the exercises of a training.
         * It will first check whether the parameters are valid.
         * If so, it will try to get the information.
         * @method getExercises
         * @param {String} trainingID The id of the training for which the exercises need to be retrieved.
         * @returns {Array} The exercises of a training
         */
        getExercises: function(trainingID) {
            check(trainingID, String);
            var trainings = Meteor.call("getTrainings");
            trainings = _.find(trainings, function(tr){ return tr.trId == trainingID; });
            return trainings.exercises;
        }
    })
}