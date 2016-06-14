if (Meteor.isServer) {
    Meteor.methods({
        getClubUsers: function () {
            var clubID = Meteor.user().profile.clubID;
            var users = Meteor.users.find({"profile.clubID": clubID}).fetch();
            users_array = [];
            users.forEach(function(user){
                users_array.push(user._id);
            });
            return users_array;
        },
        getTeamUsers: function () {
            var teamID = Meteor.user().profile.teamID;
            var users = Meteor.users.find({"profile.teamID": teamID}).fetch();
            users_array = [];
            users.forEach(function(user){
                users_array.push(user._id);
            });
            return users_array;
        },
        /**
         * @summary Function for updating user notification setting.
         * @param {key} key Which item type notification setting is for
         * @param {value} value The setting itself
         */
        updateUserNotificationSetting: function (key, value) {
            check(key, String);
            check(value, Boolean);
            var userNotifications = Meteor.users.findOne({"_id": Meteor.userId()}).profile.notifications;
            userNotifications[key] = value;
            Meteor.users.update(Meteor.userId(), {$set: {"profile.notifications": userNotifications}});
        }
    })
}
