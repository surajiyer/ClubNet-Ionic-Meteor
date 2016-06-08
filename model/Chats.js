import * as utils from '/imports/common';
import {chats, messages} from '/imports/schemas/chats';

Chats = new Mongo.Collection("Chats");
Messages = new Mongo.Collection("Messages");

if (Meteor.isServer) {
    Meteor.publish('Chats', function () {
        return Chats.find({users: this.userId});
    });

    Meteor.publish('Messages', function (chatId, messageId) {
        check(chatId, String);
        check(messageId, Match.Maybe(String));
        var selector = {};
        selector.chatID = chatId;
        if (messageId) selector._id = messageId;
        return Messages.find(selector, {sort: {createdAt: 1}});
    });
}

/**
 * Get the status of the chat
 * @returns {*}
 */
const getChatStatus = function (chatID) {
    return Chats.find({_id: chatID}).fetch()[0].status;
};

Meteor.startup(function () {
    Chats.allow({
        insert: function (userId, doc) {
            // Checks if user who is inserting is the logged in user and if they are part of the chat
            var isValidUser = userId == Meteor.userId() && _.contains(doc.users, userId);
            // Checks if user has permission to create a chat
            var hasPermission = Meteor.call('checkRights', 'Chat', 'create');
            return isValidUser && hasPermission;
        },
        update: function (userId, doc, fields) {
            // Checks if user who is inserting is the logged in user and if they are part of the chat
            var isValidUser = userId == Meteor.userId() && _.contains(doc.users, userId);
            // Player has permission if only lastMessage is updated, otherwise checks if user has permission
            var hasPermission = utils.getUserType(userId) == 'player' ?
                (fields[0] == 'lastMessage' && fields.length == 1) : Meteor.call('checkRights', 'Chat', 'edit');
            // Allow update only if chat status is 'open'
            var chatIsOpen = (!_.contains(fields, 'status') && doc.status == 'open')
                || _.contains(fields, 'status');
            return isValidUser && hasPermission && chatIsOpen;
        },
        remove: function (userId, doc) {
            // Checks if user who is inserting is the logged in user and if they are part of the chat
            var isValidUser = userId == Meteor.userId() && _.contains(doc.users, userId);
            // Checks if user has permission to delete a chat
            var hasPermission = Meteor.call('checkRights', 'Chat', 'delete');
            var allowed = isValidUser && hasPermission;
            if (allowed) {
                // If allowed to delete, then delete all messages related to this chat
                Messages.remove({chatID: doc._id});
            }
            return allowed;
        }
    });

    Messages.allow({
        insert: function (userId, doc) {
            var chat = Chats.find({_id: doc.chatID}).fetch()[0];
            // Checks if user who is inserting is the logged in user and if they are part of the chat
            var isValidUser = userId == Meteor.userId() && _.contains(chat.users, userId);
            // Checks if user has permission to send messages in a chat
            var hasPermission = Meteor.call('checkRights', 'Messages', 'create');
            // Allow update only if chat status is 'open'
            var chatIsOpen = chat.status == 'open';
            return isValidUser && hasPermission && chatIsOpen;
        },
        update: function () {
            return false;
        },
        remove: function (userId, doc) {
            var chat = Chats.find({_id: doc.chatID}).fetch()[0];
            // Checks if user who is inserting is the logged in user and if they are part of the chat
            var isValidUser = userId == Meteor.userId() && _.contains(chat.users, userId);
            // Checks if user has permission to delete messages in a chat
            var hasPermission = Meteor.call('checkRights', 'Messages', 'delete');
            return isValidUser && hasPermission;
        }
    });

    // Attach the schemas
    Chats.attachSchema(chats);
    Messages.attachSchema(messages);
});

// Meteor.methods({
//     /**
//      * Get chats associated with the given recipient userId
//      * @param userId String id of the recipient user
//      * @returns {any}
//      */
//     getChatByUserId: function (userId) {
//         return Chats.find({users: userId}).fetch()[0];
//     },
//     /**
//      * @summary Creates a chat between the currently logged-in user
//      * and another recipient user
//      * @param userId String id of the recipient user
//      * @returns {any}
//      */
//     createChat: function (userId) {
//         return Chats.insert({
//             users: [Meteor.userId(), userId]
//         });
//     },
//     /**
//      * Adds a message to the chat with the given chatId
//      * @param chatId String Id of the chat
//      * @param message String message
//      * @returns {any}
//      */
//     sendMessage: function (chatId, message) {
//         check(chatId, String);
//         check(message, String);
//
//         if (!this.isSimulation) {
//             var chat = Chats.find({_id: chatId}).fetch()[0];
//             // Checks if user who is inserting is the logged in user and if they are part of the chat
//             var isValidUser = _.contains(chat.users, Meteor.userId());
//             // Checks if user has permission to send messages in a chat
//             var hasPermission = Meteor.call('checkRights', 'Messages', 'create');
//             // Allow update only if chat status is 'open'
//             var chatIsOpen = chat.status == 'open';
//
//             var allowed = hasPermission && isValidUser && chatIsOpen;
//             if(!allowed) {
//                 throw new Meteor.Error(401, 'Insufficient permissions');
//             }
//         }
//
//         // Add the message to the database
//         var messageId = Messages.insert({chatID: chatId, message: message});
//         // If added correctly, update last message of chat
//         if (messageId) {
//             Chats.update(chatId, {$set: {lastMessage: messageId}});
//         }
//
//         console.log('sendMessage(): messageId ' + messageId);
//
//         return messageId;
//     },
//     /**
//      * Change the status of the chat
//      * @param chatId String id of chat
//      * @param newStatus String status message
//      */
//     updateChatStatus: function (chatId, newStatus) {
//         Chats.update({_id: chatId}, {$set: {status: newStatus}});
//     },
// });