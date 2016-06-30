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
            // Load chat info
            chat: function () {
                return Chat.getOneChat(chat._id);
            },
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
         * Function to read unread messages.
         * @param id String chat ID
         * @param counts message counts object
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
         * Match senderID with Id of currently logged-in user
         * @param senderId (String) user Id
         * @returns {boolean} True if logged-in user matched the senderID
         */
        $scope.isMyMessage = function (senderId) {
            return senderId == Meteor.userId();
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
            var messageId = Chat.sendMessage(chatId, $scope.message);
            if (messageId) {
                $scope.message = "";
            }
        };

        /**
         * @summary Close the input keyboard on mobile platforms
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

        /**
         * Set keyboard height and scroll to the bottom when chat input is opened
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
         * Function to animate chat scrolling to the bottom
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