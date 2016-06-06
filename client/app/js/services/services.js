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
                if (err) throw new Meteor.Error(err.reason);
                if (typeof result !== 'boolean')
                    throw new Meteor.Error('Unexpected result type');
                callback(result);
            });
        };
    })

    .service('Chat', function () {
        Meteor.subscribe('Chats');

        /**
         * Get all chats sorted on most recently used.
         */
        const getChats = function () {
            return Chats.find({}, {sort: {lastMessage: -1}});
        };

        /**
         * Load chat info into passed object with given chat ID
         * @param chatID String id of the chat
         * @param done callback to call upon retrieving chat
         * @returns {*|any}
         */
        const getOneChat = function (chatID, done) {
            var currentChat = Chats.find({_id: chatID}).fetch()[0];

            // Get recipient user
            var recipient = currentChat.users[0];
            if (recipient == Meteor.userId()) recipient = currentChat.users[1];
            recipient = Meteor.users.find({_id: recipient}).fetch()[0];

            // Load the chat title to the recipient name
            currentChat.title = recipient.profile.firstName + " " + recipient.profile.lastName;

            // Load the chat picture
            currentChat.picture = 'https://cdn0.iconfinder.com/data/icons/sports-and-fitness-flat-colorful-icons-svg/137/Sports_flat_round_colorful_simple_activities_athletic_colored-03-512.png';

            // Get the last message
            Meteor.call('getMessage', currentChat.lastMessage, function (err, result) {
                console.log('getMessage(): result ' + result);
                if (result) {
                    currentChat.lastMessage = result;
                    done();
                }
            });

            return currentChat;
        };

        /**
         * @summary Get messages of a given chat
         * @param chatID String id of the chat
         */
        const getMessages = function (chatID) {
            return Messages.find({chatID: chatID});
        };

        return {
            getChats: getChats,
            getOneChat: getOneChat,
            getMessages: getMessages,
        }
    })