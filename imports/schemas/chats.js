const chatSessions = new SimpleSchema({
    userID: {type: String},
    chatID: {type: String}
});

const chats = new SimpleSchema({
    users: {type: [String]},
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
            console.log(users);
            var userBelongsToChat = _.contains(users, Meteor.userId());
            if (!hasPermission && !userBelongsToChat)
                return 'notAllowed';
        }
    },
    lastMessage: {type: String}
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

export {chats, chatSessions, messages}