import * as utils from '/imports/common';
import {userSchema, userProfileSchema} from '/imports/schemas/users';
import {notesSchema} from '/imports/schemas/misc';
import {Meteor} from 'meteor/meteor';

process.env.MAIL_URL = "smtp://clubnet.noreply%40gmail.com:y4VP3Hq2Lvbs@smtp.gmail.com:587/";

const getUsersFromTeam = function (clubID, teamID, userTypes) {
    if (!userTypes) userTypes = utils.userTypes;
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

/**
 * @summary Rules and Methods for the users collection.
 * On startup it will set the deny and allow rules, publish the user data and attach the userSchema
 * @instancename Meteor.users
 * @param {Function} Function to execute on startup.
 */
Meteor.startup(function () {
    // Set deny rules
    // Except admins, nobody is allowed insertion, deletion and removal
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
    // Except admins, nobody is allowed insertion, deletion and removal
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
    Meteor.publish("userData", function () {
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

    /**
     *  Change the url for enrollment emails since the default includes a dash which causes
     *  some issues.
     */
    Accounts.urls.enrollAccount = function (token) {
        return Meteor.absoluteUrl("#/enroll/" + token);
    };

    /**
     *  Change the url for password reset emails since the default includes a dash which causes
     *  some issues.
     */
    Accounts.urls.resetPassword = function (token) {
        return Meteor.absoluteUrl("#/resetpassword/" + token);
    };

    // Attach user schema
    Meteor.users.attachSchema(userSchema);
});

// TODO: remove Meteor.isServer for latency compensation
Meteor.methods({
    /**
     * @summary Function for adding a new user to the collection.
     * It will check whether or not the new user adheres to the schema.
     * If so, it will add the user to the collection and it will send an enrollment email to the new user.
     * @method addUser
     * @param {Object} newUser An object that wants to be added to the collection, needs to adhere to the schema.
     * @returns {String} userId The id of the newly created user
     */
    addUser: function (newUser) {
        // Validate the information in the newUser.
        check(newUser, {
            email: String,
            password: String,
            profile: userProfileSchema
        });

        // Validate if user who is adding another user is a PR user
        //check(this.userId, Match.Where(utils.isAdmin));
        // Add the user to the collection
        var userId = Accounts.createUser(newUser);
        // Create an email template
        var credPassword = newUser.password;
        var credEmail = newUser.email;
        // AccountsTemplates.configureRoute('enrollAccount', {
        //     path: '/enroll'
        // });
        Accounts.emailTemplates.siteName = "ClubNet";
        Accounts.emailTemplates.from = "ClubNet <accounts@example.com>";
        Accounts.emailTemplates.enrollAccount.subject = function (newUser) {
            return "Welcome to ClubNet, " + newUser.profile.firstName;
        };
        Accounts.emailTemplates.enrollAccount.text = function (newUser, url) {
            console.log("New account: " + credEmail + " | " + credPassword);
            return "Welcome to ClubNet, " + newUser.profile.firstName + "!\n\n"
                + "Your club "
                + newUser.profile.clubID
                + " has signed you up for ClubNet. You can use ClubNet on your phone to read messages from your coach and receive updates from the club.\n\n"
                + "To use ClubNet, follow these steps:\n\n"
                + "1. Install the ClubNet application to your phone. You can download ClubNet from the iOS App Store if you have an Apple device, or from the Android Play Store if you have an Android device. \n"
                + "2. After installation, open ClubNet an log in using the following credentials:\n\n"
                + "E-mail address: " + credEmail + "\n"
                + "Password: " + credPassword + "\n\n"
                + "It is strongly advised that you change your password as soon as possible. To do this, follow the following steps:\n\n"

                + "Have fun using ClubNet!\n\n"
                + "Kind regards, \n"
                + "The ClubNet team.\n\n" +
                url;
        };
        // Send the email
        Accounts.sendEnrollmentEmail(userId);
        return userId;
    },
    /**
     * @summary Function for updating the information of a certain user.
     * It will first check whether the parameters are valid.
     * If so, it will update the user with the new information.
     * @method updateUserProfile
     * @param {String} userID The id of the user to have its information be updated.
     * @param {Object} newInfo The new information to be added to the user.
     */
    updateUserProfile: function (userID, newInfo) {
        // TODO: should not check full user profile schema for update
        check(userID, String);
        check(newInfo, userProfileSchema);
        if (Meteor.userId() != userID) {
            check(Meteor.userId(), Match.Where(utils.isAdmin));
        }
        Meteor.users.update(
            {_id: userID},
            {$set: {profile: newInfo}}
        );
    },
    /**
     * @summary Function for getting the information of a certain user.
     * This can only be done by a user that had admin level rights.
     * It will first check whether the parameters are valid and if the user is an admin.
     * If so, it will try to get the information.
     * @method getUserInfo
     * @param {String} userID The id of the user who's information needs to be retrieved.
     * @return {Object} The information of the user
     */
    getUserInfo: function (userID) {
        check(userID, String);
        check(Meteor.userId(), Match.Where(utils.isAdmin));
        return Meteor.users.find({_id: userID}).fetch()[0];
    },
    /**
     * @summary Function for getting the type of the current logged in user.
     * It will first check whether the parameters are valid.
     * If so, it will try to get the type of the user.
     * @method getUserType
     * @returns {String} Type of the user
     */
    getUserType: function () {
        check(Meteor.userId(), String);
        //return Meteor.users.find({_id: this.userId}).fetch()[0].profile.type;
        return Meteor.user().profile.type;
    },
    /**
     * @summary Function for adding a note.
     * It will first check whether the parameters adhere to the schema.
     * If so, it will store the note as a part of the user.
     * @method addNote
     * @param newNote The note that needs to be added.
     */
    addNote: function (newNote) {
        check(newNote, notesSchema);
        Meteor.users.update(
            {_id: Meteor.userId()},
            {$push: {'notes': newNote}}
        );
    },
    /**
     * @summary Function for updating a note.
     * It will first check whether the parameters adhere to the schema.
     * If so, it will find the note and update the text.
     * @method updateNote
     * @param newNote The note that needs to be updated, but with different text.
     */
    updateNote: function (newNote) {
        check(newNote, notesSchema);
        Meteor.users.update(
            {
                _id: Meteor.userId(),
                notes: {$elemMatch: {itemID: newNote.itemID}}
            },
            {$set: {"notes.$.text": newNote.text}}
        );
    }
});