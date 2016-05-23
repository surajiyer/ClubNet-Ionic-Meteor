import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const TypesCollection = new Mongo.Collection("ItemTypes");

TypesCollection.deny({
    insert: function () {
        return false;
    },
    update: function () {
        return false;
    },
    remove: function () {
        return false;
    }
});

if (Meteor.isServer) {
    
    Meteor.publish('ItemTypes', function publishItemTypes() {
        return TypesCollection.find({});
    });

    Meteor.methods({
        getItemTypes: function () {
            return TypesCollection.find().fetch()[0];
        },
    });
}