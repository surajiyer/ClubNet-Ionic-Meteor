import * as utils from '/imports/common';
import { clubSchema } from '/imports/schemas/misc';


Clubs = new Mongo.Collection("Clubs");

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
        updateClub: function (updatedItem) {
            check(updatedItem, Object);
            var clubID = Meteor.user().profile.clubID;
            Clubs.update(
                {_id: clubID},
                {$set: updatedItem}
            );

            return updatedItem;
        },
        getClub: function () {
            var clubID = Meteor.user().profile.clubID;
            return Clubs.find({_id: clubID}).fetch()[0];
        }
    })
}