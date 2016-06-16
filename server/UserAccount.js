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

/*
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
     * @summary Add a new user account.
     * @param {Object} newUser A document object that contains all attributes of the user account to be added.
     * @return {String} The id of the newly added user.
     * @after After a new user account is added, a confirmation email is sent to the user.
     * @throws error if the 'newUser' does not conform to the database scheme.
     * @throws error if the input parameters do not have the required type.
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
     * @summary Update the information of a user.
     * @param {String} userID The id of the user account whose information is to be updated.
     * @param {Object} newInfo A document object that contains all attributes of the updated user.
     * @throws error if the 'newInfo' does not conform to the database scheme.
     * @throws error if the input parameters do not have the required type.
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
     * @summary Get the information of a user account specified by the email address.
     * @param{String} email The email address of the user account.
     * @return{Object} A document object that contains all the attributes of the user account specified by the email address.
     * @throws error if the input parameters do not have the required type.
     */
    getUserInfoByEmail: function (email) {
        check(email, String);
        // check(Meteor.userId(), Match.Where(utils.isAdmin));
        return Meteor.users.find({"emails.address": email}).fetch()[0];
    },
    
    /**
     * @summary Retrieve the information of a user account specified by the id.
     * @param{String} userID The id of the user account to be retrieve.
     * @return{Object} A document object that contains all the attributes of the user account specified by the id.
     * @throws error if the logged in user is not allowed to retrieve user accounts information.
     * @throws error if the input parameters do not have the required type.
     */
    getUserInfo: function (userID) {
        check(userID, String);
        check(Meteor.userId(), Match.Where(utils.isAdmin));
        return Meteor.users.find({_id: userID}).fetch()[0];
    },
    
    /**
     * @summary Get the type of the logged in user.
     * @returns {String} Type of the logged in user.
     */
    getUserType: function () {
        check(Meteor.userId(), String);
        return Meteor.user().profile.type;
    },
    
    /**
     * @summary Get the size of the team of the logged in user.
     * @return{Integer} The number of players in the team.
     */
    getTeamSize: function () {
        check(Meteor.userId(), String);
        var teamID = utils.getUserTeamID(Meteor.userId());
        return Meteor.users.find({'profile.type': 'player', 'profile.teamID': teamID}).count();
    },
    
    /**
     * @summary Retrieve all users in the club of the logged in user.
     * @returns {Object[]} Array of document objects that contains all the user accounts in the club of the logged in user.
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
     * @summary Retrieve all users in the team of the logged in user.
     * @return {Object[]} Array of document objects that contains all the user accounts in the team of the logged in user.
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
     * @summary Update the notification setting of the logged in user.
     * @param {String} itemType The feed item type to which the notification setting is changed.
     * @param {Boolean} value A boolean that indicates whether to subscribe to the specified feed item type.
     * @return None.
     * @throws error if the input parameters do not have the required type.
     */
    updateUserNotificationSetting: function (itemType, value) {
       check(itemType, Match.Where(function (type) {
           check(type, String);
           return utils.isValidType(type);
       }));
       check(value, Boolean);
       var loggedInUser = Meteor.userId();
       check(loggedInUser, String);
       var userNotifications = Meteor.users.findOne({"_id": loggedInUser}).profile.notifications;
       userNotifications[itemType] = value;
       Meteor.users.update(loggedInUser, {$set: {"profile.notifications": userNotifications}});
   }
});