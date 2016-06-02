import {chats, messages} from '/imports/schemas/chats';

Chats = new Mongo.Collection("Chats");
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
        if (messageId) selector._id = messageId;
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
            var isValidUser = userId == Meteor.userId();
            var hasPermission = Meteor.call('checkRights', 'Chat', 'create');
            var chatContainsValidUser = _.contains(doc.users, Meteor.userId());
            console.log('Chat insert allowed: '+(isValidUser && hasPermission && chatContainsValidUser));
            return isValidUser && hasPermission && chatContainsValidUser;
        },
        update: function (userId, doc, fields) {
            var isValidUser = userId == Meteor.userId() && _.contains(doc.users, userId);
            var hasPermission = Meteor.call('checkRights', 'Chat', 'edit');
            var chatIsOpen = (!_.contains(fields, 'status') && doc.status == 'open')
                || _.contains(fields, 'status');
            return isValidUser && hasPermission && chatIsOpen;
        },
        remove: function (userId, doc) {
            var isValidUser = userId == Meteor.userId() && _.contains(doc.users, userId);
            var hasPermission = Meteor.call('checkRights', 'Chat', 'delete');
            var allowed = isValidUser && hasPermission;
            if (allowed) {
                Messages.remove({chatID: doc._id});
            }
            return allowed;
        }
    });

    Messages.allow({
        insert: function (userId, doc) {
            var chat = Chats.find({_id: doc.chatID});
            var isValidUser = userId == Meteor.userId() && _.contains(chat.users, userId);
            var hasPermission = Meteor.call('checkRights', 'Messages', 'create');
            var chatIsOpen = chat.status == 'open';
            return isValidUser && hasPermission && chatIsOpen;
        },
        update: function () {
            return false;
        },
        remove: function (userId) {
            var isValidUser = userId == Meteor.userId();
            var hasPermission = Meteor.call('checkRights', 'Messages', 'delete');
            return isValidUser && hasPermission;
        }
    });

    // Attach the schemas
    Chats.attachSchema(chats);
    Messages.attachSchema(messages);
});