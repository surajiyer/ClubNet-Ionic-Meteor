Push.debug = true;

Push.allow({
    send: function (userId, notification) {
        var isValidUser = !!userId && userId == Meteor.userId() && Meteor.user().profile.type == "coach";
        return isValidUser;
    }
});

/**
 * @summary Function for sending a notification to a given list of users. The type, title and text of the notification
 *  has to be passed to the function. A list of users who will receive the notification should also be passed.
 * @param {String} type The type of the notification..
 * @param {String} title The title of the notification.
 * @param {String} text The content of the notification.
 * @param {String[]} users The list of user ids who will receive the notification.
 */
const userNotification = function (type, title, text, users) {
    check(type, String);
    check(text, String);
    check(title, String);
    check(users, [String]);
    var badge = 1;
    Push.send({
        from: 'push',
        title: title,
        text: text,
        badge: badge,
        sound: 'airhorn.caf',
        query: {
            userId: {$in: users}
        }
    });
};

/*
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
    /**
     * @summary Send push notifications to all users in the club who subscribed to the notification of the feed item type
     * when a new feed item of that type is created. The type, title and text of the notification should be passed to this
     *  function.
     * @param{String} type The type of the created feed item.
     * @param{String} title The title to be shown in the push notification.
     * @param{String} text .The text to be shown in the push notification.
     * @return None.
     * @throws error if the logged in user is not authorized to send push notification.
     * #throws erro if the parameters do not have the required types. The type, title and text must be String objects.
     */
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
            'profile.clubID' : clubID
        };
        var notificationType = 'profile.notifications.'+type;
        selector[notificationType] = true;
        var users = Meteor.users.find(selector, {fields: {_id: 1}}).fetch();
        console.log('1: ', users);
        users = _.pluck(users, '_id');
        console.log('2:', users);
        userNotification(type, title, text, users);
    },
    /**
     * @summary Send push notifications to all users in the team who subscribed to the notification of the feed item type
     * when a new feed item of that type is created.
     * @param{String} type The type of the created feed item.
     * @param{String} title The title to be shown in the push notification.
     * @param{String} text .The text to be shown in the push notification.
     * @return None.
     * @throws error if the logged in user is not authorized to send push notification.
     */
    sendTeamNotification: function (type, title, text) {
        check(type, String);
        check(title, String);
        check(text, String);
        check(Meteor.userId(), String);

        console.log("Test 1");

        var isValidUser = Meteor.user().profile.type == "coach";
        if(!isValidUser) {
            throw new Meteor.Error('401', 'Not Authorized');
        }
        var teamID = Meteor.user().profile.teamID;
        var selector = {
            _id: {$ne: Meteor.userId()},
            'profile.type': {$ne: "coach"},
            'profile.teamID' : {$exists: true, $eq: teamID}
        };

        console.log("Test 2");
        
        var notificationType = 'profile.notifications.'+type;
        selector[notificationType] = true;
        var users = Meteor.users.find(selector, {fields: {_id: 1}}).fetch();
        users = _.pluck(users, '_id');
        userNotification(type, title, text, users);
    }
});