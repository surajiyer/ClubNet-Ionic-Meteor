import * as utils from '/imports/common';
import {chats, messages} from '/imports/schemas/chats';

Chats = new Mongo.Collection("Chats");
Messages = new Mongo.Collection("Messages");
if (Meteor.isClient) {
    MessagesCount = new Mongo.Collection('MessagesCount');
}

if (Meteor.isServer) {
    Meteor.publish('Chats', function () {
        return Chats.find({users: this.userId}, {sort: {lastMessage: -1}});
    });

    Meteor.publish('Messages', function (options) {
        check(options, Object);
        check(options.chatId, String);
        check(options.messageId, Match.Maybe(String));
        check(options.limit, Match.Maybe(Number));
        var selector = {};
        selector.chatID = options.chatId;
        if (options.messageId) selector._id = options.messageId;
        var projection = {sort: {createdAt: -1}};
        if (options.limit) projection.limit = options.limit;
        return Messages.find(selector, projection);
    });

    Meteor.publish('MessagesCount', function (chatId) {
        check(chatId, String);

        // Add the messages count of given chat to collection
        let countObject = { count: Messages.find({chatID: chatId}).count()};
        this.added('MessagesCount', chatId, countObject);

        // Function to update the count of messages of given chat
        self = this;
        var updateCount = function () {
            let countObject = { count: Messages.find({chatID: chatId}).count()};
            self.changed('MessagesCount', chatId, countObject);
        };

        // Update count by observing changes in Messages collection for given chat
        Messages.find({chatID: chatId}).observeChanges({
            added: updateCount, removed: updateCount
        });

        // Tell the subscriber that the subscription is ready
        this.ready();
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
            var isValidUser = !!userId && userId == Meteor.userId() && _.contains(doc.users, userId);
            // Check if all recipients within chat belong to the same team
            var belongToSameTeam = doc.users
                && utils.getUserClubID(doc.users[0]) == utils.getUserClubID(doc.users[1])
                && utils.getUserTeamID(doc.users[0]) == utils.getUserTeamID(doc.users[1]);
            // Checks if user has permission to create a chat
            var hasPermission = Meteor.call('checkRights', 'Chat', 'create');
            return isValidUser && belongToSameTeam && hasPermission;
        },
        update: function (userId, doc, fields) {
            // Checks if user who is inserting is the logged in user and if they are part of the chat
            var isValidUser = !!userId && userId == Meteor.userId() && _.contains(doc.users, userId);
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
            var isValidUser = !!userId && userId == Meteor.userId() && _.contains(doc.users, userId);
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
            var isValidUser = !!userId && userId == Meteor.userId() && _.contains(chat.users, userId);
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
            var isValidUser = !!userId && userId == Meteor.userId() && _.contains(chat.users, userId);
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