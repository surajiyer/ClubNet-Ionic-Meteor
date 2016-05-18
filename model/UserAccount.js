import userSchemas from '/imports/schemas/users'

Meteor.startup(function () {
    if (Meteor.isServer) {
        Meteor.publish("userData", function () {
            return Meteor.users.find(
                {_id: this.userId},
                {fields: {'other': 1, 'things': 1}}
            );
        });
    }

    // _.each(userSchemas, function (schema) {
    //     Meteor.users.attachSchema(userSchemas[schema], {selector: {type: schema}});
    // });
});

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
    }
});