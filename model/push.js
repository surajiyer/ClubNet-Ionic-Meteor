if (Meteor.isServer) {
    Push.debug = true;

    Push.allow({
        send: function(userId, notification) {
            return true; // Allow all users to send
        }
    });

    Meteor.methods({
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
        userNotification: function(text,title,users) {
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
                    userId: {$in : users}
                },
                gcm: {
                    image: logo
                }
            });
        },
        removeHistory: function() {
            NotificationHistory.remove({}, function(error) {
                if (!error) {
                    console.log("All history removed");
                }
            });
        }
    });
}