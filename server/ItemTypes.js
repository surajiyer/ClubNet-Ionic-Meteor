import {feedItemTypesSchema} from '/imports/schemas/feedItems';

/**
 * This collection holds all the possible types of feed items that can be created
 * @type {Mongo.Collection}
 */
TypesCollection = new Mongo.Collection("ItemTypes");

/**
 * @summary Rules and Methods for the TypesCollection collection.
 * On startup it will set the deny rules and attach the feedItemTypesSchema
 * @param {Function} Function to execute on startup.
 */
Meteor.startup(function () {
    // Attach item types schema
    TypesCollection.attachSchema(feedItemTypesSchema);
});

Meteor.methods({
    /**
     * @summary Function for getting all the item types in the collection
     * @returns {Object} The item types in the collection.
     */
    getItemTypes: function () {
        return TypesCollection.find().fetch();
    },
    /**
     * @summary Get information of a single item type
     * @param typeID Voting, Form, .. etc
     * @returns {Object} The item type info.
     */
    getItemType: function (typeID) {
        check(typeID, String);
        try {
            return TypesCollection.find({_id: typeID}).fetch()[0];
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    }
});