if (Meteor.isServer) {
    Meteor.methods({

        /**
         * @summary Returns an array of all club's users
         * @method getClubUsers
         * @returns {Array} Array of all club's users
         */
        getClubUsers: function () {
            var clubID = Meteor.user().profile.clubID;
            var users = Meteor.users.find({"profile.clubID": clubID}).fetch();
            users_array = [];
            users.forEach(function(user){
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
            users_array = [];
            users.forEach(function(user){
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
            var userNotifications = Meteor.users.findOne({"_id": Meteor.userId()}).profile.notifications;
            userNotifications[key] = value;
            Meteor.users.update(Meteor.userId(), {$set: {"profile.notifications": userNotifications}});
        }
    })
}
