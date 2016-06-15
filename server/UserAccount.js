import * as utils from '/imports/common';
import {userSchema, userProfileSchema} from '/imports/schemas/users';
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

    // Attach user schema
    Meteor.users.attachSchema(userSchema);

    // Publish userData
    Meteor.publish('userData', function () {
        var loggedInUser = this.userId;
        if (!loggedInUser) {
            return this.ready();
        }
        var userType = utils.getUserType(loggedInUser);
        var clubID = utils.getUserClubID(loggedInUser);
        switch (userType) {
            case 'pr':
                return Meteor.users.find({'profile.clubID': clubID}, {fields: {services: 0}});
            case 'coach':
                var teamID = utils.getUserTeamID(loggedInUser);
                return getUsersFromTeam(clubID, teamID, ['coach', 'player']);
            case 'player':
                var teamID = utils.getUserTeamID(loggedInUser);
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
        return Meteor.absoluteUrl("#/redirect/enroll/" + token);
    };

    /**
     *  Change the url for password reset emails since the default includes a dash which causes
     *  some issues.
     */
    Accounts.urls.resetPassword = function (token) {
        return Meteor.absoluteUrl("#/redirect/resetpassword/" + token)
        + "\n\n" 
        + "PR users please use the following link: "
        + "\n\n"
        + Meteor.absoluteUrl("#/resetpassword/" + token);
    };
});

// TODO: remove Meteor.isServer for latency compensation
Meteor.methods({
    sendShareEmail: function (options) {
        Email.send(options);
    }, 
    
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
        Accounts.emailTemplates.from = "ClubNet <clubnet.noreply@gmail.com>";
        Accounts.emailTemplates.enrollAccount.subject = function (newUser) {
            return "Welcome to ClubNet, " + newUser.profile.firstName;
        };
        Accounts.emailTemplates.enrollAccount.text = function (newUser, url) {
            console.log("New account: " + credEmail + " | " + credPassword);
            return "Welcome to ClubNet, " + newUser.profile.firstName + "!\n\n"
                + "Your club "
                + "has signed you up for ClubNet. You can use ClubNet on your phone to read messages from your coach and receive updates from the club.\n\n"
                + "To use ClubNet, click on the following link and set your desired password. \n\n"
                + url
                + "\n\n"
                + "Have fun using ClubNet!\n\n"
                + "Kind regards, \n"
                + "The ClubNet team.\n\n";
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
        return Meteor.user().profile.type;
    },
    getTeamSize: function () {
        check(Meteor.userId(), String);
        var teamID = utils.getUserTeamID(Meteor.userId());
        return Meteor.users.find({type: 'player', 'profile.teamID': teamID}).count();
    },
    /**
     * @summary Returns an array of all club's users
     * @method getClubUsers
     * @returns {Array} Array of all club's users
     */
    getClubUsers: function () {
        var clubID = Meteor.user().profile.clubID;
        var users = Meteor.users.find({"profile.clubID": clubID}).fetch();
        var users_array = [];
        _.each(users, function (user) {
            users_array.push(user._id);
        });
        return users_array;
    },

    /**
     * @summary Returns an array of users that are affiliated with the same team as the logged in user
     * @method getTeamUsers
     * @returns {Array} Array of users that are affiliated with the same team as the logged in user
     */
    getTeamUsers: function () {
        var teamID = Meteor.user().profile.teamID;
        var users = Meteor.users.find({"profile.teamID": teamID}).fetch();
        var users_array = [];
        _.each(users, function (user) {
            users_array.push(user._id);
        });
        return users_array;
    },
    /**
     * @summary Function for updating user notification setting.
     * @param {String} key Which item type notification setting is for
     * @param {String} value The setting itself
     */
    updateUserNotificationSetting: function (key, value) {
        check(key, String);
        check(value, Boolean);
        var loggedInUser = Meteor.userId();
        check(loggedInUser, String);
        var userNotifications = Meteor.users.findOne({"_id": loggedInUser}).profile.notifications;
        userNotifications[key] = value;
        Meteor.users.update(loggedInUser, {$set: {"profile.notifications": userNotifications}});
    }
});