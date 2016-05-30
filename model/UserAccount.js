import * as utils from '/imports/common';
import {userSchema, userProfileSchema} from '/imports/schemas/users';
import {notesSchema} from '/imports/schemas/misc';

const getUsersFromTeam = function (clubID, teamID, userTypes) {
    if(!userTypes) userTypes = utils.userTypes;
    return Meteor.users.find(
        {
            'profile.clubID': clubID,
            'profile.teamID': teamID,
            'profile.type': {$in: userTypes}
        },
        {
            fields: {
                '_id': 1,
                'profile.firstName': 1,
                'profile.lastName': 1,
                'profile.type': 1
            }
        }
    );
};

Meteor.startup(function () {
    // Set deny rules
    Meteor.users.deny({
        insert: function (userId) {
            return !utils.isAdmin(userId);
        },
        update: function (userId) {
            return !utils.isAdmin(userId);
        },
        remove: function (userId) {
            return !utils.isAdmin(userId);
        }
    });

    // Set allow rules
    Meteor.users.allow({
        insert: function (userId) {
            return utils.isAdmin(userId);
        },
        update: function (userId) {
            return utils.isAdmin(userId);
        },
        remove: function (userId) {
            return utils.isAdmin(userId);
        }
    });

    // Publish userData
    if (Meteor.isServer) {
        Meteor.publish("userData", function () {
            console.log(this.userId);
            var userType = utils.getUserType(this.userId);
            switch (userType) {
                case 'pr':
                    return Meteor.users.find({});
                case 'coach':
                    var clubID = utils.getUserClubID(this.userId);
                    var teamID = utils.getUserTeamID(this.userId);
                    return getUsersFromTeam(clubID, teamID, ['coach', 'player']);
                case 'player':
                    var clubID = utils.getUserClubID(this.userId);
                    var teamID = utils.getUserTeamID(this.userId);
                    return getUsersFromTeam(clubID, teamID, ['coach']);
                default:
                    this.ready();
            }
        });
    }

    // Attach user schema
    Meteor.users.attachSchema(userSchema);
});

// TODO: remove Meteor.isServer for latency compensation
if (Meteor.isServer) {
    Meteor.methods({
        addUser: function (newUser) {
            check(newUser, {
                email: String,
                password: String,
                profile: userProfileSchema
            });
            //check(this.userId, Match.Where(utils.isAdmin));
            var userID = Accounts.createUser(newUser);
            return userID;
        },
        updateUserProfile: function (newInfo) {
            check(newInfo, Object);
            Meteor.users.update(
                {_id: this.userId},
                {$set: {profile: newInfo}}
            );
        },
        getUserInfo: function (userID) {
            check(userID, String);
            check(this.userId, Match.Where(utils.isAdmin));
            return Meteor.users.find({_id: userID}).fetch();
        },
        getUserType: function () {
            check(this.userId, String);
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
}