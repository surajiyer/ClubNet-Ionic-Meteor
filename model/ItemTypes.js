import {feedItemTypesSchema} from '/imports/schemas/feedItems';
/**
 * @summary Rules and Methods for the TypesCollection collection.
 * On startup it will set the deny rules and attach the feedItemTypesSchema
 * This collection holds all the possible types of items that can be created.
 * @instancename TypesCollection
 * @param {Object} feedItemTypesSchema The schema that will the attached to the TypesCollection collection.
 */
TypesCollection = new Mongo.Collection("ItemTypes");

Meteor.startup(function () {
    // Attach item types schema
    TypesCollection.attachSchema(feedItemTypesSchema);

    // Set deny rules
    // Nobody is allowed to do anything
    TypesCollection.deny({
        insert: function () {
            return true;
        },
        update: function () {
            return true;
        },
        remove: function () {
            return true;
        }
    });
});

if (Meteor.isServer) {
    /**
     * @summary Publish method for subscribers to get the items in the collection
     * @method ItemTypes
     * @returns {Object} The item types in the collection.
     */
    Meteor.publish('ItemTypes', function () {
        return TypesCollection.find({});
    });

    Meteor.methods({
        /**
         * @summary Function for getting all the item types in the collection
         * @method getItemTypes
         * @returns {Object} The item types in the collection.
         */
        getItemTypes: function () {
            return TypesCollection.find().fetch();
        }
    });
}