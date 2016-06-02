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
        }
    },
    lastMessage: {
        type: String,
        optional: true
    }
});

export {chats, messages}