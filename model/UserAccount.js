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

if(Meteor.isServer) {
    process.env.MAIL_URL="smtp://clubnet.noreply%40gmail.com:y4VP3Hq2Lvbs@smtp.gmail.com:587/"; 
    Meteor.methods({
        addUser: function (newUser) {
            check(newUser, {
                email: String,
                password: String,
                profile: userProfileSchema
            });
            credPassword = newUser.password;
            credEmail = newUser.email;
            userId = Accounts.createUser(newUser);
            Accounts.emailTemplates.siteName = "ClubNet";
            Accounts.emailTemplates.from = "ClubNet <accounts@example.com>";
            Accounts.emailTemplates.enrollAccount.subject = function (newUser) {
                return "Welcome to ClubNet, " + newUser.profile.firstName;
            };
            Accounts.emailTemplates.enrollAccount.text = function (newUser, url) {
                console.log(newUser);
                return "Welcome to ClubNet, " + newUser.profile.firstName + "!\n\n"
                    + "Your club " + newUser.profile.clubID +  " has signed you up for the ClubNet system. You can use the following credentials to log in:\n\n"
                    + "E-mail address: " + credEmail + "\n"
                    + "Password: " + credPassword + "\n\n"
                    +   "Kind regards,\n" +
                        "The ClubNet team.";
            };
            Accounts.sendEnrollmentEmail(userId);
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
}