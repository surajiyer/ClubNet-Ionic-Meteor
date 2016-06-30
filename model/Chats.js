import * as utils from '/imports/common';
import {chats, messages} from '/imports/schemas/chats';

Chats = new Mongo.Collection("Chats");
Messages = new Mongo.Collection("Messages");
if (Meteor.isClient) {
    MessagesCount = new Mongo.Collection('MessagesCount');
}

if (Meteor.isServer) {
    Meteor.publish('Chats', function () {
        check(this.userId, String);

        // Get all chats corresponding to logged-in user sorted by lastMessage timestamp
        return Chats.find({users: this.userId}, {sort: {lastMessage: -1}});
    });

    Meteor.publish('Messages', function (options) {
        check(options, Object);
        check(options.chatId, String);
        check(options.messageId, Match.Maybe(String));
        check(options.limit, Match.Maybe(Number));

        // Get all messages of given chatId or specific message of
        // given messageId
        var selector = {};
        selector.chatID = options.chatId;
        if (options.messageId) selector._id = options.messageId;

        // Sort to descending order of message timestamp
        var projection = {sort: {createdAt: -1}};

        // Limit number of messages to given limit
        if (options.limit) projection.limit = options.limit;

        return Messages.find(selector, projection);
    });

    Meteor.publish('MessagesCount', function (chatId) {
        check(chatId, String);
        check(this.userId, String);
        self = this;

        var allMessages = Messages.find({chatID: chatId});
        var unreadMessages = Messages.find({
            chatID: chatId,
            senderID: {$ne: this.userId},
            read: false
        });

        // Add the messages count of given chat to collection
        let countObject = {
            count: allMessages.count(),
            unreadCount: unreadMessages.count()
        };
        this.added('MessagesCount', chatId, countObject);

        // Function to update the count of messages of given chat
        var updateCount = function () {
            var localCount = {
                count: Messages.find({chatID: chatId}).count()
            };
            if(countObject.count != localCount.count) {
                countObject.count = localCount.count;
                self.changed('MessagesCount', chatId, localCount);
            }
        };

        // Function to update count of unread messages in given chat
        var updateUnreadCount = function () {
            var localCount = {
                unreadCount: Messages.find({
                    chatID: chatId,
                    senderID: {$ne: self.userId},
                    read: false
                }).count()
            };
            if(countObject.unreadCount != localCount.unreadCount) {
                if(self.userId == 'Nw58wxngQgah79hPW') {
                    console.log('unreadCount', countObject.unreadCount);
                }
                countObject.unreadCount = localCount.unreadCount;
                self.changed('MessagesCount', chatId, localCount);
            }
        };

        // Update count by observing changes in Messages collection for given chat
        var allMessagesHandle = allMessages.observeChanges({
            added: updateCount,
            removed: updateCount
        });

        // Update unread messages count by observing changes
        var unreadMessagesHandle = unreadMessages.observeChanges({
            added: updateUnreadCount,
            removed: updateUnreadCount
        });

        // Inform client subscription is ready on client side
        this.ready();

        this.onStop(function () {
            allMessagesHandle.stop();
            unreadMessagesHandle.stop();
        });
    });
}

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
            var hasPermission = Meteor.call('checkRights', 'Chat', 'delete')
                && Meteor.call('checkRights', 'Messages', 'delete');
            return isValidUser && hasPermission;
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
        update: function (userId, doc) {
            var chat = Chats.find({_id: doc.chatID}).fetch()[0];
            // Checks if user who is inserting is the logged in user and if they are part of the chat
            var isValidUser = !!userId && userId == Meteor.userId() && _.contains(chat.users, userId);
            return isValidUser;
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

    if (Meteor.isServer) {
        Meteor.methods({
            /**
             * @summary Update the status of the messages in a chat session to read. When a user opens the dialog of
             * a chat session in which there are unread messages, this function should be called. The status of all the messages in
             * that chat session are then updated to read.
             * @param {String} chatId The id of the chat session of which the the status of the messages need to be updated to read.
             * @return None.
             * @throws error if the input parameters do not have the required type. The chatId must be a String object.
             * @after The attribute 'read' of all messages in the specified chat session are set to true.
             */
            readMessages: function (chatId) {
                check(chatId, String);

                // Get chat for authorization
                var chat = Chats.find({_id: chatId}).fetch()[0];

                // Checks if user who is inserting is the logged in user and if they are part of the chat
                var isValidUser = Match.test(Meteor.userId(), String) && _.contains(chat.users, Meteor.userId());
                if (!isValidUser) {
                    throw new Meteor.Error('401', 'Not authorized');
                }

                // Update unread messages to read
                Messages.update({
                    chatID: chatId,
                    senderID: {$ne: Meteor.userId()},
                    read: false
                }, {$set: {read: true}}, {multi: true});
            },
            /**
             * @summary Delete a chat session that belongs to the logged in user. When a user clicks the delete button
             * of a chat session, this function should be called. This chat session along with all the associated history
             * messages will be deleted.
             * @param {String} chatId The id of the chat session to be deleted.
             * @return None.
             * @throws error if the input parameters do not have the required type.
             */
            deleteChat: function (chatId) {
                check(chatId, String);

                // Get chat for authorization
                var chat = Chats.find({_id: chatId}).fetch()[0];

                // Checks if user who is inserting is the logged in user and if they are part of the chat
                var isValidUser = Match.test(Meteor.userId(), String) && _.contains(chat.users, Meteor.userId());
                if (!isValidUser) {
                    throw new Meteor.Error('401', 'Not authorized');
                }

                // Delete the chat
                Chats.remove(chatId);
                // Delete all messages related to this chat
                Messages.remove({chatID: chatId});
            }
        });
    }
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