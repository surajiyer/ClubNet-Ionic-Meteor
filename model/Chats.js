import {chats, chatSessions, messages} from '/imports/schemas/chats';

Chats = new Mongo.Collection("Chats");
//ChatSessions = new Mongo.Collection("ChatSessions");
Messages = new Mongo.Collection("Messages");

if (Meteor.isServer) {
    Meteor.publish('Chats', function () {
        return Chats.find({users: this.userId});
    });

    Meteor.publish('Messages', function (chatId, messageId) {
        check(chatId, String);
        check(messageId, Match.Maybe(messageId));
        var selector = {};
        selector.chatID = chatId;
        if(messageId) selector._id = messageId;
        return Messages.find(selector);
    });
}

/**
 * Get the status of the chat
 * @returns {*}
 */
const getChatStatus = function (chatID) {
    return Chat.find({_id: chatID}).fetch()[0].status;
};

Meteor.startup(function () {
    Chats.allow({
        insert: function (userId, doc) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Chat', 'create');
            var chatIsOpen = getChatStatus(doc.chatID) == 'open';
            return isValidUser && hasPermission && chatIsOpen;
        },
        update: function (userId, doc) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Chat', 'edit');
            return isValidUser && hasPermission;
        },
        remove: function (userId, doc) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Chat', 'delete');
            var allowed = isValidUser && hasPermission;
            if (allowed) {
                Messages.remove({chatID: doc._id});
            }
            return allowed;
        }
    });

    Messages.allow({
        insert: function (userId) {
            var isValidUser = userId == this.userId;
            return isValidUser;
        },
        update: function () {
            return false;
        },
        remove: function (userId) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Messages', 'delete');
            return isValidUser && hasPermission;
        }
    });

    // Attach the schemas
    Chats.attachSchema(chats);
    //ChatSessions.attachSchema(chatSessions);
    Messages.attachSchema(messages);
});