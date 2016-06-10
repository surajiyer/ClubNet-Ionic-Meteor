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

    // if (Meteor.isServer) {
    //     /**
    //      * @summary Publish method for subscribers to get the items in the collection
    //      * @method ItemTypes
    //      * @returns {Object} The item types in the collection.
    //      */
    //     Meteor.publish('ItemTypes', function () {
    //         // Check if you have the right to view this type
    //         return TypesCollection.find();
    //     });
    // }
});

if (Meteor.isServer) {
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
        },
        getItemTypesToCreate: function (types) {
            check(types, [String]);
            return TypesCollection.find({_id: {$in: types}});
        }
    });
}