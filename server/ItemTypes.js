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
     * @summary Get all item types that the logged in user is allowed to view. This function uses the checkRights() function
     *  to filter out the item types that can not be viewed by the logged in user.
     * @return {Object[]} An array that contains the documents of all item types. Each document contains all information
     *  of an item type, including the identifier, label and icon.
     */
    getItemTypes: function () {
        var itemTypes = TypesCollection.find().fetch();
        itemTypes = _.filter(itemTypes, function(type) {
            return Meteor.call("checkRights", type._id, "view");
        });
        return itemTypes;
    },
    /**
     * @summary Get information of a single item type specified by the identifier. A document that contains the
     * identifier, label and icon of that item type will be returned. If there is no such feed item stored in the database
     * @param{String} typeID The identifier of the item type.
     * @return {Object} A document object that contains all the attributes of the specified item type.
     * @throws error if the input parameters do not have the required type. The typeID must be a String object.
     * @throws error if there is no such item typed stored in the database.
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