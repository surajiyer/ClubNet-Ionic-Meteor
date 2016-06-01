angular.module('app.services', [])

    .service('currentClub', function ($meteor) {
        /**
         * Get the current club and hold it in the service
         */
        return {
            getClub : function(){
                return  $meteor.call('getClub');
            }
        }
    })

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
         * @returns {*|any}
         */
        const getOneChat = function (chatID) {
            var currentChat = Chats.find({_id: chatID}).fetch()[0];
            Meteor.subscribe('Messages', currentChat._id, currentChat.lastMessage, function () {
                // Get recipient user
                var recipient = currentChat.users[0];
                if (recipient == Meteor.userId()) recipient = currentChat.users[1];
                recipient = Meteor.users.find({_id: recipient}).fetch()[0];

                // Load the chat title to the recipient name
                currentChat.title = recipient.profile.firstName + " " + recipient.profile.lastName;
                currentChat.picture = 'https://cdn0.iconfinder.com/data/icons/sports-and-fitness-flat-colorful-icons-svg/137/Sports_flat_round_colorful_simple_activities_athletic_colored-03-512.png';
                currentChat.lastMessage = Messages.find({_id: currentChat.lastMessage}).fetch()[0];
            });
            return currentChat;
        };

        /**
         * Get messages of a given chat
         */
        const getMessages = function (chatID) {
            console.log("chatID = ", chatID);
            Meteor.subscribe('Messages', chatID);
            console.log(Messages.find({chatID: chatID}).count());
            return Messages.find({chatID: chatID});
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
            getMessages: getMessages
        }
    })