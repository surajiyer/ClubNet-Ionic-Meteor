import * as utils from '/imports/common';
import { clubSchema } from '/imports/schemas/misc';

Clubs = new Mongo.Collection("Clubs");

// Clubs.insert({
//     name: 'cluby',
//     logo: 'http://media1.santabanta.com/full1/Miscellaneous/Logos/logos-135a.jpg',
//     colorPrimary: '#000',
//     colorSecondary: '#fff',
//     colorAccent: '#aaa',
//     heroesMax: 5
// });

Meteor.startup(function () {

    Clubs.allow({
        // only allow posting if you are logged in and other validations
        insert: function (userId, doc) {
            return true;
        },
        update: function (userId, doc) {
            return true;
        },
        remove: function (userId, doc) {
            return true;
        }
    });

    if (Meteor.isServer) {
        Meteor.publish('clubs', function () {
            var clubID = Meteor.users.find({_id: this.userId}).fetch()[0].profile.clubID;
            return Clubs.find({});
        });
    }

    // Attach the club schema
    Clubs.attachSchema(clubSchema);
});

if (Meteor.isServer) {
    Meteor.methods({
        /**
         * @summary Update the information of a club.
         * @param {Object} updatedItem A document object that contains all attributes of the club with updated information.
         * @return {Object} The document of the updated club.
         */
        updateClub: function (updatedItem) {
            check(updatedItem, Object);
            var clubID = Meteor.user().profile.clubID;
            Clubs.update(
                {_id: clubID},
                {$set: updatedItem}
            );

            return updatedItem;
        },
        /**
         * @summary Retrieve the information of the club of the logged in user..
         * @return {Object} The document of the club of the logged in user.
         */
        getClub: function () {
            var clubID = Meteor.user().profile.clubID;
            return Clubs.find({_id: clubID}).fetch()[0];
        }
    })
}