import userSchema from '/imports/schemas/users';

/**
 * Check if user is a PR user.
 * @returns {boolean}
 */
function isAdmin(userId) {
    // TODO: check if PR user
    return true;
}

Meteor.startup(function () {
    // Set deny rules
    Meteor.users.deny({
        insert: function (userId) {
            return !isAdmin(userId);
        },
        update: function (userId) {
            return !isAdmin(userId);
        },
        remove: function (userId) {
            return !isAdmin(userId);
        }
    });

    // Set allow rules
    Meteor.users.allow({
        insert: function (userId) {
            return isAdmin(userId);
        },
        update: function (userId) {
            return isAdmin(userId);
        },
        remove: function (userId) {
            return isAdmin(userId);
        }
    });

    // Publish userData
    if (Meteor.isServer) {
        Meteor.publish("userData", function () {
                if (isAdmin(this.userId)) {
                    return Meteor.users.find({});
                } else {
                    this.ready();
                }
            }
        );
    }

    // Attach user schema
    // _.each(userSchemas, function (schema) {
    //     Meteor.users.attachSchema(userSchemas[schema], {selector: {'profile.type': schema}});
    // });
    Meteor.users.attachSchema(userSchema);
});

Meteor.methods({
    addUser: function (newUser) {
        if (typeof newUser.email !== 'string')
            throw new Meteor.Error('Email not provided');
        if (typeof newUser.password !== 'string')
            throw new Meteor.Error('Password not provided');
        var userID = Accounts.createUser(newUser);
        return userID;
    },
    updateUser: function (newInfo) {
        Meteor.users.update(
            {_id: this.userId},
            {$set: newInfo},
            {bypassCollection2: true}
        );
    },
    getUserInfo: function (userID) {
        if (!isAdmin) {
            this.ready();
            return;
        }
        return Meteor.users.find({_id: userID}).fetch();
    },
    getType: function () {
        //return Meteor.users.find({_id: this.userId}).fetch()[0].profile.type;
        return Meteor.user().profile.type;
    },
    addNote: function (newNote) {
        newNote.creatorID = this.userId;
        Meteor.users.update(
            {_id: newNote.creatorID},
            {
                $push: {
                    'notes': {
                        itemID: newNote.itemID,
                        text: newNote.text
                    }
                }
            },
            {bypassCollection2: true});
    },
    updateNote: function (newNote) {
        Meteor.users.update(
            {
                _id: newNote.creatorID,
                notes: {$elemMatch: {itemID: newNote.itemID}}
            },
            {$set: {"notes.$.text": newNote.text}},
            {bypassCollection2: true}
        );
    },
});