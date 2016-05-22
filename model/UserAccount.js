import {isAdmin} from '/imports/common';
import {userSchema, userProfileSchema} from '/imports/schemas/users';
import {notesSchema} from '/imports/schemas/misc';

Meteor.startup(function () {
    // Set deny rules
    Meteor.users.deny({
        insert: function (userId) {
            return !isAdmin(userId);
        },
        update: function (userId) {
            return !isAdmin(userId);
        },
        remove: function (userId) {
            return !isAdmin(userId);
        }
    });

    // Set allow rules
    Meteor.users.allow({
        insert: function (userId) {
            return isAdmin(userId);
        },
        update: function (userId) {
            return isAdmin(userId);
        },
        remove: function (userId) {
            return isAdmin(userId);
        }
    });

    // Publish userData
    if (Meteor.isServer) {
        Meteor.publish("userData", function () {
                if (isAdmin(this.userId))
                    return Meteor.users.find({});
                this.ready();
            }
        );
    }

    // Attach user schema
    Meteor.users.attachSchema(userSchema);
});

Meteor.methods({
    addUser: function (newUser) {
        check(newUser, {
            email: String,
            password: String,
            profile: userProfileSchema
        });
        var userID = Accounts.createUser(newUser);
        return userID;
    },
    updateUserProfile: function (newInfo) {
        // TODO: should not check full user profile schema for update
        check(newInfo, userProfileSchema);
        Meteor.users.update(
            {_id: this.userId},
            {$set: {profile: newInfo}}
        );
    },
    getUserInfo: function (userID) {
        check(userID, String);
        check(this.userId, Match.Where(isAdmin));
        return Meteor.users.find({_id: userID}).fetch();
    },
    getUserType: function () {
        check(this.userId, String);
        //return Meteor.users.find({_id: this.userId}).fetch()[0].profile.type;
        return Meteor.user().profile.type;
    },
    addNote: function (newNote) {
        check(newNote, notesSchema);
        Meteor.users.update(
            {_id: this.userId},
            {$push: {'notes': newNote}}
        );
    },
    updateNote: function (newNote) {
        check(newNote, notesSchema);
        Meteor.users.update(
            {
                _id: this.userId,
                notes: {$elemMatch: {itemID: newNote.itemID}}
            },
            {$set: {"notes.$.text": newNote.text}}
        );
    },
});