SimpleSchema.messages({
    cannotUpdate: 'Message can only be read by recipient',
    invalidOperator: 'Update modifier not allowed here'
});

const messages = new SimpleSchema({
    senderID: {
        type: String,
        autoValue: function () {
            if (this.isInsert) {
                return Meteor.userId();
            }
        },
        denyUpdate: true
    },
    message: {
        type: String,
        denyUpdate: true
    },
    chatID: {
        type: String,
        denyUpdate: true
    },
    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert)
                return new Date;
        },
        denyUpdate: true
    },
    read: {
        type: Boolean,
        defaultValue: false
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
            if (this.isInsert) {
                return "open";
            }
        }
    },
    lastMessage: {
        type: String,
        defaultValue: ''
    }
});

export {chats, messages}