angular.module('chatControllers', [])

/**-----------------------------------------------------------------------------------------------------------------
 *  @summary Controller for loading chats
 */
    .controller('chatsCtrl', function ($scope, $ionicModal, $state, AccessControl, Chat, CommonServices) {
        // Subscribe to user info of chat recipients
        $scope.subscribe('userData');

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

        /**
         * Check if user can change the status of a chat
         * @type {boolean}
         */
        $scope.canModifyStatus = false;
        AccessControl.getPermission('Chat', 'edit', (result) => {
            $scope.canModifyStatus = result;
            if (result) {
                $scope.modifyStatus = function ($event, chatId, newStatus) {
                    $event.stopPropagation();
                    Chat.updateChatStatus(chatId, newStatus, (err) => {
                        if (err) {
                            CommonServices.showAlert('Error', 'Failed to update chat status.');
                        }
                        $scope.$apply();
                    });
                };
            }
        });

        /**
         * Show chat notification in menu if any chat contains unread messages
         * @type {Array}
         */
        $scope.chatNotifications = {};

        $scope.autorun(function () {
            var chatNotifications = $scope.getReactively('chatNotifications', true);
            console.log('chatNotifications', chatNotifications);
            console.log('chatNotifications values', _.values(chatNotifications));
            var showChatNotification = _.contains(_.values(chatNotifications), true);
            console.log(showChatNotification);
            Chat.showChatNotification.set(showChatNotification);
        });

        /**
         * Show the create chat button
         * @type {boolean}
         */
        $scope.canCreateChat = false;
        AccessControl.getPermission('Chat', 'create', function (result) {
            $scope.canCreateChat = result;
            if (result) {
                $ionicModal.fromTemplateUrl('client/app/views/chats/newChat.ng.html', {
                    scope: $scope
                }).then(function (chatModal) {
                    $scope.chatModal = chatModal;
                });

                /**
                 * @summary Open the Create New Chat modal. This function will be called when the logged in user creates
                 *  a new chat session.
                 * @returns None.
                 */
                $scope.addChat = function () {
                    $scope.chatModal.show();
                };

                /**
                 * @summary Close the Create New Chat modal. This function will be called when the logged in user closes
                 *  an existing chat session.
                 * @returns None.
                 */
                $scope.closeModal = function () {
                    $scope.chatModal.hide();
                };

                /**
                 * @summary Start a new chat with the given userId. This function will be called when the logged in user
                 *  selects a user to start a new chat session.
                 * @param {String} userId The id of the user with whom the logged in user wants to chat.
                 */
                $scope.startChat = function (userId) {
                    if (!$scope.canCreateChat) return;
                    $scope.closeModal();
                    var chat = Chat.getChatByUserId(userId);
                    if (chat) {
                        Chat.updateChatStatus(chat._id, "open", (err, result) => {
                            if (!err && result) {
                                $state.go('menu.chat', {chatId: chat._id});
                            }
                        });
                    } else {
                        var chatID = Chat.createChat(userId);
                        $state.go('menu.chat', {chatId: chatID});
                    }
                };
            }
        });
    })

    /**-----------------------------------------------------------------------------------------------------------------
     *  @summary Controller for loading information of each chat
     */
    .controller('chatInfoCtrl', function ($scope, Chat) {
        // Get last message
        var chat = $scope.chat;
        $scope.subscribe('Messages', () => {
            return [{chatId: chat._id, limit: 1}];
        });

        // Get the number of messages in given chat
        // $scope.subscribe('MessagesCount', () => {
        //     return [chat._id]
        // });

        // Show Chat notification on chat info
        $scope.autorun(function () {
            // Show notification in menu if unread messages are there
            var showChatNotification = $scope.getReactively('showChatNotification');
            if (Match.test(showChatNotification, Boolean)) {
                $scope.$parent.chatNotifications[chat._id] = showChatNotification;
                console.log($scope.$parent.chatNotifications);
            }
        });
        $scope.showChatNotification = false;

        $scope.helpers({
            /**
             * @summary Loading the information of a chat session. All information of a chat session that is stored in
             *  the database will be returned.
             * @returns {Object} A document object that stores all information of a chat session.
             */
            chat: function () {
                return Chat.getOneChat(chat._id);
            },
            /**
             * @summary Getting the last message of a chat session.
             * @returns {Object} A MongoDB cursor of the last message in the chat session.
             */
            lastMessage: function () {
                return Messages.find({chatID: chat._id}, {sort: {createdAt: -1}});
            }
        });

        // Stores the current last message object
        var currentLastMessage;

        // Update unread messages view on chat info
        $scope.autorun(function () {
            var lastMessage = $scope.getReactively('lastMessage[0]', true);
            if (!lastMessage) return;
            $scope.showChatNotification = lastMessage.senderID != Meteor.userId()
                && !lastMessage.read;
            if (currentLastMessage) {
                $scope.showChatNotification = $scope.showChatNotification ||
                    (lastMessage._id != currentLastMessage._id
                    && lastMessage.createdAt > currentLastMessage.createdAt);
            }
            currentLastMessage = lastMessage;
        });

        // Delete the chat notification variable from parent on destroy
        $scope.$on('destroy', () => {
            delete $scope.$parent.showChatNotification[chat._id];
        });

        // MessagesCount.find(chat._id).observeChanges({
        //     added: function (id, counts) {
        //         console.log(id, counts);
        //     },
        //     changed: function (id, counts) {
        //         console.log(id, counts);
        //         // Automatically update chat notification icon in side menu
        //         Chat.showChatNotification.set(counts.unreadCount != 0)
        //     }
        // });
    })

    /**-----------------------------------------------------------------------------------------------------------------
     *  @summary Controller for chatting functions within chats
     */
    .controller('chatCtrl', function ($scope, $state, $stateParams, Chat, $ionicScrollDelegate, $timeout) {
        /**
         * Initialize messages
         * @type {*|any}
         */
        const chatId = $stateParams.chatId;
        const isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
        var limit = 0, limitIncrementValue = 20;
        let preventAutoScroll = false;

        /**
         * Helper functions
         */
        $scope.helpers({
            chat: function () {
                return Chat.getOneChat(chatId);
            },
            messages: function () {
                return Chat.getMessages(chatId);
            },
            messagesCount: function () {
                return MessagesCount.find(chatId);
            }
        });

        /**
         * @summary Subscribes to messages
         */
        $scope.refresh = function () {
            const totalNrOfMessages = $scope.messagesCount[0].count;
            const nrOfLoadedMessages = $scope.messages.length;
            const nrOfUnloadedMessages = totalNrOfMessages - nrOfLoadedMessages;
            if (totalNrOfMessages > nrOfLoadedMessages) {
                // var firstMessage = Messages.find({chatID: chatId}, {limit:1}).fetch()[0];
                var newLimit = limit +
                    (nrOfUnloadedMessages > limitIncrementValue
                    || totalNrOfMessages < limitIncrementValue ? limitIncrementValue : nrOfUnloadedMessages);
                $scope.subscribe('Messages', () => {
                    preventAutoScroll = true;
                    return [{chatId: chatId, limit: newLimit}];
                }, () => {
                    // var newFirstMessages = Messages.find({chatID: chatId},
                    //     {sort: {createdAt: 1}, limit:1}).fetch()[0];
                    // if(firstMessage._id == newFirstMessages._id) {
                    //     $scope.limit -= limitIncrementValue;
                    // }
                    limit = newLimit;

                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
            } else {
                $scope.$broadcast('scroll.refreshComplete');
            }
        };

        /**
         * Update total number of messages in the chat
         */
        $scope.subscribe('MessagesCount', () => {
            return [chatId]
        }, () => {
            // Subscribe to an initial set of messages
            $scope.refresh();

            $scope.$on("$destroy", function () {
                // Delete the chat if it contains no messages
                var nrOfMessages = $scope.messagesCount[0].count;
                if (nrOfMessages == 0) {
                    Chat.deleteChat(chatId);
                }
            });
        });

        /**
         * Function to read the unread messages of a chat session. The chat session is specified by the id. This function
         *  will be called when the user opens a chat session in which there are unread messages.
         * @param {String} id The id of the chat session.
         * @returns None.
         */
        var readUnreadMessages = function (id, counts) {
            // If there are unread messages,
            if (counts.unreadCount > 0) {
                // Set messages to read
                Meteor.call('readMessages', chatId, function (err) {
                    if (!err) {
                        $scope.$parent.showChatNotification = false;
                    }
                });
            }
        };

        // Reactively update recipient messages to read as they come in
        MessagesCount.find(chatId).observeChanges({
            added: readUnreadMessages, changed: readUnreadMessages
        });

        /**
         * @summary Match the id of the sender with id of the currently logged-in user. When the messages are being loaded,
         * this function will be called per message to check whether this message is sent by the logged in user.
         * @param {String} senderId The id of the sender.
         * @returns {Boolean} True if the logged-in user matched the senderID. Otherwise false.
         */
        $scope.isMyMessage = function (senderId) {
            return senderId == Meteor.userId();
        };

        /**
         * @summary Function to send a message. This function will be called when the logged in user sends a new message.
         * @returns None.
         */
        $scope.sendMessage = function () {
            // If message is empty, don't send
            if (_.isEmpty($scope.message)) return;

            // Trim the message
            $scope.message.trim();

            // Send the message and get the new message Id
            var messageId = Chat.sendMessage(chatId, $scope.message);
            if (messageId) {
                $scope.message = "";
            }
        };

        /**
         * @summary Close the input keyboard on mobile platforms. This function will be called when the keyboard for
         * chat should be closed.
         * @returns None.
         */
        $scope.closeKeyboard = function () {
            if (Meteor.isCordova) {
                ionic.keyboard.hide();
            }
        };

        /**
         * @summary Scroll to the bottom of the chat.
         * @param {Boolean} animate Option to apply scroll animation. True if an animation is desired. Otherwise false.
         * @returns None.
         */
        $scope.scrollBottom = function (animate) {
            $timeout(() => {
                $ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom(animate);
            }, 300);
        };

        /**
         * @summary Set keyboard height and scroll to the bottom when chat input is opened. This function sets the height
         *  of the keyboard and automatically place the chat history to the last message of the chat session.
         * @returns None.
         */
        $scope.inputUp = function () {
            if (isIOS) {
                ionic.keyboard.height = 216;
            }
            $scope.scrollBottom(true);
        };

        /**
         * Resize keyboard and reset scroll when input is closed
         */
        $scope.inputDown = function () {
            if (isIOS) {
                ionic.keyboard.height = 0;
            }
            $ionicScrollDelegate.$getByHandle('chatScroll').resize();
        };

        /**
         * @summary Function to animate chat scrolling to the bottom. This function will be called when the chat needs
         *  to be scrolled to the bottom.
         * @returns None.
         */
        $scope.autoScroll = function () {
            let recentMessagesNum = $scope.messages.length;
            $scope.autorun(() => {
                const currMessagesNum = $scope.getCollectionReactively('messages').length;
                const animate = recentMessagesNum != currMessagesNum;
                recentMessagesNum = currMessagesNum;
                if (preventAutoScroll) {
                    preventAutoScroll = false;
                    return;
                }
                $scope.scrollBottom(animate);
            });
        };

        $scope.autoScroll();
    })