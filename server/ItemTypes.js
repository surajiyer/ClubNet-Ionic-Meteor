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
     * @summary Get the filtered item types.
     * @return {Object[]} An array that contains the documents of the filtered item types.
     */
    getItemTypes: function () {
        var itemTypes = TypesCollection.find().fetch();
        itemTypes = _.filter(itemTypes, function(type) {
            return Meteor.call("checkRights", type._id, "view");
        });
        return itemTypes;
    },
    /**
     * @summary Get all the defined item types.
     * @return {Object[]} An array that contains the documents of all item types.
     */
    getAllItemTypes: function () {
        return TypesCollection.find().fetch();
    },
    /**
     * @summary Get information of a single item type.
     * @param{String} typeID The id of the item type. 
     * @return {Object} A document object that contains all the attributes of the specified item type.
     * @throws error if the input parameters do not have the required type.
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