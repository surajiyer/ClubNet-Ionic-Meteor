Push.debug = true;

Push.allow({
    send: function (userId, notification) {
        var isValidUser = !!userId && userId == Meteor.userId() && Meteor.user().profile.type == "coach";
        return isValidUser;
    }
});

/**
 * @summary Send a notification to a given list of users
 * @param {String} type The notification's type.
 * @param {String} title The notification's title.
 * @param {String} text The notification's content type.
 * @param {String} users The notification's target users.
 * @method userNotification
 */
const userNotification = function (type, title, text, users) {
    check(type, String);
    check(text, String);
    check(title, String);
    check(users, [String]);
    var badge = 1;
    var logo = Meteor.call('getClub').logo;
    Push.send({
        from: 'push',
        title: title,
        text: text,
        badge: badge,
        sound: 'airhorn.caf',
        query: {
            userId: {$in: users}
        },
        gcm: {
            image: logo
        }
    });
};

/**
 * @summary Send a notification to everyone
 * @method sendGlobalNotification
 * @param {String} text The notification's content type.
 * @param {String} title The notification's title.
 */
const sendGlobalNotification = function (text, title) {
    var badge = 1;
    Push.send({
        from: 'push',
        title: title,
        text: text,
        badge: badge,
        sound: 'airhorn.caf',
        query: {
            // this will send to all users
        }
    });
};

Meteor.methods({
    sendClubNotification: function (type, title, text) {
        check(type, String);
        check(title, String);
        check(text, String);
        check(Meteor.userId(), String);
        var isValidUser = Meteor.user().profile.type == "coach";
        if(!isValidUser) {
            throw new Meteor.Error('401', 'Not Authorized');
        }
        var clubID = Meteor.user().profile.clubID;
        var selector = {
            _id: {$ne: Meteor.userId()},
            'profile.clubID': clubID,
            'profile.notifications': {}
        };
        selector.profile.notifications[type] = true;
        console.log(selector);
        var users = Meteor.users.find(selector, {fields: {_id: 1}}).fetch();
        users = _.pluck(users, '_id');
        userNotification(type, title, text, users);
    },
    sendTeamNotification: function (type, title, text) {
        check(type, String);
        check(title, String);
        check(text, String);
        check(Meteor.userId(), String);
        var isValidUser = Meteor.user().profile.type == "coach";
        if(!isValidUser) {
            throw new Meteor.Error('401', 'Not Authorized');
        }
        var teamID = Meteor.user().profile.teamID;
        var selector = {
            _id: {$ne: Meteor.userId()},
            'profile.type': {$ne: "coach"},
            'profile.teamID': {$exists: true, $eq: teamID},
            'profile.notifications': {}
        };
        selector.profile.notifications[type] = true;
        console.log(selector);
        var users = Meteor.users.find(selector, {fields: {_id: 1}}).fetch();
        users = _.pluck(users, '_id');
        userNotification(type, title, text, users);
    }
});