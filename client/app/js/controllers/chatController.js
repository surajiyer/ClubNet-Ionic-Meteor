angular.module('chatControllers', [])

    /**
     *  @summary Controller for loading chats
     */
    .controller('chatsCtrl', function ($scope, $ionicModal, $state, AccessControl, Chat) {
        /**
         * Show the create chat button
         * @type {boolean}
         */
        $scope.canCreateChat = false;

        // Display create chat button
        AccessControl.getPermission('Chat', 'create', function (result) {
            $scope.canCreateChat = result;
        });

        $ionicModal.fromTemplateUrl('client/app/views/chats/newChat.ng.html', {
            scope: $scope
        }).then(function (chatModal) {
            $scope.chatModal = chatModal;
        });

        /**
         * Open the Create New Chat modal.
         */
        $scope.addChat = function () {
            $scope.chatModal.show();
        };

        /**
         * Close the Create New Chat modal.
         */
        $scope.closeModal = function () {
            $scope.chatModal.hide();
        };

        /**
         * Start a new chat with the given userId.
         * @param userId
         */
        $scope.startChat = function (userId) {
            if (!$scope.canCreateChat) return;
            $scope.closeModal();
            var chat = Chat.getChatByUserId(userId);
            if (chat) {
                //Meteor.call('updateChatStatus', chat._id, "open");
                Chat.updateChatStatus(chat._id, "open");
                $state.go('menu.chat', {chatId: chat._id});
            } else {
                var chatID = Chat.createChat(userId);
                console.log('createChat() chatId: ' + chatID);
                $state.go('menu.chat', {chatId: chatID});
            }
        };

        $scope.helpers({
            /**
             * Get a list of all chat sessions.
             */
            chats: Chat.getChats,
            /**
             * Get a list of all users you can create a chat with.
             * @returns {*}
             */
            users: function () {
                return Meteor.users.find({_id: {$ne: Meteor.userId()}});
            }
        });
    })

    /**
     *  @summary Controller for loading information of each chat
     */
    .controller('chatInfoCtrl', function ($scope, Chat) {
        // Get last message
        Meteor.subscribe('Messages', $scope.chat._id, $scope.chat.lastMessage);

        $scope.helpers({
            // Load chat info
            chat: function () {
                return Chat.getOneChat($scope.chat._id, function () {
                    $scope.$apply();
                });
            }
        });
    })

    /**
     *  @summary Controller for chatting functions within chats
     */
    .controller('chatCtrl', function ($scope, $state, $stateParams, Chat) {
        /**
         * Initialize messages
         * @type {*|any}
         */
        var chatID = $stateParams.chatId;
        Meteor.subscribe('Messages', chatID);

        $scope.isMyMessage = function (senderID) {
            return senderID == Meteor.userId();
        };

        /**
         * @summary Function to send a message
         */
        $scope.sendMessage = function () {
            // If message is empty, don't send
            if (_.isEmpty($scope.message)) return;

            // Trim the message
            $scope.message.trim();

            // Send the message and get the new message Id
            var messageId = Chat.sendMessage(chatID, $scope.message);
            if(messageId) {
                $scope.message = "";
            }
            // Meteor.call('sendMessage', chatID, $scope.message, function (e, messageId) {
            //     // If message was sent successfully, clear the message field
            //     if (messageId) {
            //         $scope.message = "";
            //     }
            // });
        };

        /**
         * Helper functions
         */
        $scope.helpers({
            chat: function () {
                return Chat.getOneChat(chatID, function () {
                    $scope.$apply();
                });
            },
            messages: function () {
                return Chat.getMessages(chatID);
            }
        });
    })