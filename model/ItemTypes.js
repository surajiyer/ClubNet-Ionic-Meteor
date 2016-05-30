import {feedItemTypesSchema} from '/imports/schemas/feedItems';

TypesCollection = new Mongo.Collection("ItemTypes");

Meteor.startup(function () {
    TypesCollection.attachSchema(feedItemTypesSchema);

    TypesCollection.deny({
        insert: function () {
            // Enable in case of testing for feed item tests
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
     * Cannot return a cursor in Meteor.methods, only EJON-able values.
     */
    Meteor.publish('ItemTypes', function () {
        return TypesCollection.find({});
    });

    Meteor.methods({
        getItemTypes: function () {
            return TypesCollection.find().fetch();
        }
    });
}