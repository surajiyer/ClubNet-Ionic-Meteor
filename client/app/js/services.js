angular.module('app.services', [])

    .service('currentClub', function ($meteor) {
        /**
         * @summary Get the current club and hold it in the service
         */
        return {
            getClub: function () {
                return $meteor.call('getClub');
            }
        }
    })

    .service('AccessControl', function () {
        /**
         * @summary Check if user is permitted to get access to various aspects of the service.
         * @param itemType the item for which permission is being requested
         * @param permission the type of permission being requested for the item: create, view, edit or delete.
         * @param callback function to call with the result as argument
         */
        this.getPermission = function (itemType, permission, callback) {
            Meteor.call('checkRights', itemType, permission, function (err, result) {
                if (err) throw new Meteor.Error(err.error);
                if (typeof result !== 'boolean')
                    throw new Meteor.Error('Unexpected result type');
                callback(result);
            });
        };
    })

    .service('Chat', function () {
        var handle = Meteor.subscribe('Chats');

        /**
         * Get all chats sorted on most recently used.
         */
        const getChats = function () {
            return Chats.find({}, {sort: {lastMessage: -1}});
        };

        /**
         * Get chats associated with the given recipient userId
         * @param userId String id of the recipient user
         * @returns {any}
         */
        const getChatByUserId = function (userId) {
            return Chats.find({users: userId}).fetch()[0];
        };

        /**
         * Load chat info into passed object with given chat ID
         * @param chatID String id of the chat
         * @returns {*|any}
         */
        const getOneChat = function (chatID) {
            var currentChat = Chats.find({_id: chatID}).fetch()[0];

            // Get recipient user
            var recipient = currentChat.users[0];
            if (recipient == Meteor.userId()) recipient = currentChat.users[1];
            recipient = Meteor.users.find({_id: recipient}).fetch()[0];

            // Load the chat title to the recipient name
            currentChat.title = recipient.profile.firstName + " " + recipient.profile.lastName;currentChat.picture = 'https://cdn0.iconfinder.com/data/icons/sports-and-fitness-flat-colorful-icons-svg/137/Sports_flat_round_colorful_simple_activities_athletic_colored-03-512.png';
            currentChat.picture = 'https://cdn0.iconfinder.com/data/icons/sports-and-fitness-flat-colorful-icons-svg/137/Sports_flat_round_colorful_simple_activities_athletic_colored-03-512.png';

            Meteor.subscribe('Messages', currentChat._id, currentChat.lastMessage, function () {
                currentChat.lastMessage = Messages.find({_id: currentChat.lastMessage}).fetch()[0];
            });

            return currentChat;
        };

        /**
         * @summary Creates a chat between the currently logged-in user
         * and another recipient user
         * @param userId String id of the recipient user
         * @returns {any}
         */
        const createChat = function(userId) {
            return Chats.insert({
                users: [Meteor.userId(), userId]
            });
        };

        /**
         * @summary Get messages of a given chat
         * @param chatID String id of the chat
         */
        const getMessages = function (chatID) {
            return Messages.find({chatID: chatID});
        };

        /**
         * Change the status of the chat
         * @param chatId String id of chat
         * @param newStatus String status message
         */
        const changeStatus = function (chatId, newStatus) {
            Chats.update({_id: chatId}, {$set: {status: newStatus}});
        };

        const sendMessage = function (chatId, message) {
            return Messages.insert({chatID: chatId, message: message});
        };

        return {
            createChat: createChat,
            getChats: getChats,
            getOneChat: getOneChat,
            getChatByUserId: getChatByUserId,
            updateChatStatus: changeStatus,
            sendMessage: sendMessage,
            getMessages: getMessages,
        }
    })