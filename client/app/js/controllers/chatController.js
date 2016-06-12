angular.module('chatControllers', [])

/**
 *  @summary Controller for loading chats
 */
    .controller('chatsCtrl', function ($scope, $ionicModal, $state, AccessControl, Chat) {
        // Subscribe to user info of chat recipients
        $scope.subscribe('userData');

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
    .controller('chatCtrl', function ($scope, $state, $stateParams, Chat, $ionicScrollDelegate, $timeout) {
        /**
         * Initialize messages
         * @type {*|any}
         */
        var chatID = $stateParams.chatId;
        var isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();

        Meteor.subscribe('Messages', chatID);

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

        /**
         * Match senderID with Id of currently logged-in user
         * @param senderID String user Id
         * @returns {boolean} True if logged-in user matched the senderID
         */
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
            if (messageId) {
                $scope.message = "";
            }
        };

        /**
         * Close the input keyboard on mobile platforms
         */
        $scope.closeKeyboard = function () {
            if (Meteor.isCordova) {
                ionic.keyboard.hide();
            }
        };

        /**
         * Scroll to the bottom of the chat
         * @param animate Boolean option to apply scroll animation
         */
        $scope.scrollBottom = function (animate) {
            $timeout(() => {
                $ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom(animate);
            }, 300);
        };

        $scope.inputUp = function () {
            if (isIOS) {
                ionic.keyboard.height = 216;
            }
            $scope.scrollBottom(true);
        };

        $scope.inputDown = function () {
            if (isIOS) {
                ionic.keyboard.height = 0;
            }
            $ionicScrollDelegate.$getByHandle('chatScroll').resize();
        };

        $scope.autoScroll = function () {
            let recentMessagesNum = $scope.messages.length;
            $scope.autorun(() => {
                const currMessagesNum = $scope.getCollectionReactively('messages').length;
                const animate = recentMessagesNum != currMessagesNum;
                recentMessagesNum = currMessagesNum;
                $scope.scrollBottom(animate);
            });
        };

        console.log(ionic.keyboard.height);
        $scope.autoScroll();
    })