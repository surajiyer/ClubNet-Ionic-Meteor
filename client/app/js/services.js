angular.module('app.services', [])

    .factory('BlankFactory', [function () {

    }])

    .service('AccessControl', function () {
        /**
         * Check if user is permitted to get access to various aspects of the service.
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
         * Load chat info into passed object with given chat ID
         * @param chatID
         * @param currentChat
         * @returns {*|any}
         */
        const getOneChat = function(chatID, currentChat) {
            currentChat = Chats.find({_id: chatID}).fetch()[0];
            Meteor.subscribe('Messages', currentChat._id, currentChat.lastMessage, function () {
                // Get recipient user
                var recipient = currentChat.users[0];
                if(recipient == Meteor.userId()) recipient = currentChat.users[1];
                recipient = Meteor.users.find({_id: recipient});

                // Load the chat title to the recipient name
                currentChat.title = recipient.profile.firstName + " " + recipient.profile.lastName;
                currentChat.picture = 'http://www.iconsdb.com/icons/preview/green/football-2-xl.png';
                currentChat.lastMessage = Messages.find({_id: currentChat.lastMessage}).fetch()[0];
            });
        };

        /**
         * Get messages of a given chat
         */
        const getMessages = function(chatID) {
            return Messages.find({chatId: chatID});
        };

        /**
         * Change the status of the chat
         * @param newStatus
         */
        const changeStatus = function (newStatus) {
            Chats.update({_id: chat._id}, {status: newStatus});
        };

        const sendMessage = function (message) {
            Messages.insert({chatID: chat._id, message: message});
        };

        return {
            getChats: getChats,
            getOneChat: getOneChat,
        }
    })