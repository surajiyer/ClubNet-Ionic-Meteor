const chatSessions = new SimpleSchema({
    userID: {type: String},
    chatID: {type: String}
});

const chats = new SimpleSchema({
    lastMessage: {type: String}
});

const messages = new SimpleSchema({
    senderID: {
        type: String,
        optional: true,
        autoValue: function () {
            return Meteor.userId();
        }
    },
    chatID: {type: String},
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            if (this.isInsert)
                return new Date;
        }
    }
});

export {chats, chatSessions, messages}