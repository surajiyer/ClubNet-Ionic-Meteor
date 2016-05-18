import userSchemas from '/imports/schemas/users'

Meteor.startup(function () {
    // _.each(userSchemas, function (schema) {
    //     Meteor.users.attachSchema(userSchemas[schema], {selector: {type: schema}});
    // });
});

/**
 * Check if user is a PR user.
 * @returns {boolean}
 */
function isAdmin() {
    return true;
}

if (Meteor.isServer) {
    Meteor.publish("userData", function () {
            if (isAdmin(this.userId)) {
                return Meteor.users.find({});
            } else {
                return Meteor.users.find(
                    {_id: this.userId},
                    {fields: {'other': 1, 'things': 1}}
                );
            }
        }
    );
}

Meteor.methods({
    addUser: function (newUser) {
        if (typeof newUser.email !== 'string')
            throw new Meteor.Error('Email not provided');
        if (typeof newUser.password !== 'string')
            throw new Meteor.Error('Password not provided');
        // newUser.bettingResults = [];
        newUser.profile = {
            firstName: 'suraj',
            lastName: 'iyer',
            type: "coach",
            clubID: "1",
            teamID: "supersonic-ultrasonic-beautiful-rolling-kick"
        };
        var userID = Accounts.createUser(newUser);
        return userID;
    },
    getTeam: function () {
        try {
            return Meteor.users.findOne({_id: this.userId})[0].profile.clubID;
        } catch (err) {
            console.log(err.error);
        }
    }
});