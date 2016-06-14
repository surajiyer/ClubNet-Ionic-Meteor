if (Meteor.isServer) {
    Push.debug = true;

    Push.allow({
        send: function(userId, notification) {
            return true; // Allow all users to send
        }
    });

    Meteor.methods({


        /**
         * @summary Send a notification to everyone
         * @method serverNotification
         * @param {String} text The notification's content type.
         * @param {String} title The notification's title.
         */
        serverNotification: function(text,title) {
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
        },

        /**
         * @summary Send a notification to a specific user
         * @param {String} type The notification's type.
         * @param {String} text The notification's content type.
         * @param {String} title The notification's title.
         * @param {String} users The notification's target users.
         * @method userNotification
         */
        userNotification: function(type,text,title,users) {
            check(type, String);
            check(text, String);
            check(title, String);
            check(users, [String]);
            var userNotifications = Meteor.users.findOne({"_id": Meteor.userId()}).profile.notifications;
            if (userNotifications[type] == false) return;
            var badge = 1;
            var logo = Meteor.call('getClub').logo;
            Push.send({
                from: 'push',
                title: title,
                text: text,
                badge: badge,
                sound: 'airhorn.caf',
                query: {
                    userId: {$in : users}
                },
                gcm: {
                    image: logo
                }
            });
        },

        /**
         * @summary Remove the notification history.
         * @method removeHistory
         */
        removeHistory: function() {
            NotificationHistory.remove({}, function(error) {
                if (error) {
                    console.log("Error while removing all history");
                }
            });
        }
    });
}