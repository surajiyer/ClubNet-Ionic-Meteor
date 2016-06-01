const chatSessions = new SimpleSchema({
    userID: {type: String},
    chatID: {type: String}
});

const messages = new SimpleSchema({
    senderID: {
        type: String,
        optional: true,
        autoValue: function () {
            return Meteor.userId();
        },
        denyUpdate: true
    },
    message: {type: String},
    chatID: {
        type: String,
        denyUpdate: true
    },
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            if (this.isInsert)
                return new Date;
        },
        denyUpdate: true
    }
});

const chats = new SimpleSchema({
    users: {
        type: [String],
        minCount: 2,
        maxCount: 2
    },
    status: {
        type: String,
        allowedValues: ["open", "closed"],
        autoValue: function () {
            if (this.isInsert)
                return "open";
        },
        custom: function () {
            var hasPermission = Meteor.call('checkRights', 'ChatStatus', 'edit');
            var users = this.siblingField('users').value;
            // TODO: remove this
            console.log(users);
            var userBelongsToChat = _.contains(users, Meteor.userId());
            if (!hasPermission && !userBelongsToChat)
                return 'notAllowed';
        }
    },
    lastMessage: {
        type: String,
        optional: true
    }
});

export {chats, chatSessions, messages}