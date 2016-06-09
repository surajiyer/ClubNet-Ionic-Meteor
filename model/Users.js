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
        }
    })
}
