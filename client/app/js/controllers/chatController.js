angular.module('chatControllers', [])

/**
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
            if(result) {
                $scope.modifyStatus = function (chatId, newStatus) {
                    Chat.updateChatStatus(chatId, newStatus, (err) => {
                        if(err) {
                            CommonServices.showAlert('Error', 'Failed to update chat status.');
                        }
                    });
                };
            }
        });

        /**
         * Show the create chat button
         * @type {boolean}
         */
        $scope.canCreateChat = false;
        AccessControl.getPermission('Chat', 'create', function (result) {
            $scope.canCreateChat = result;
            if(result) {
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
                            if(!err && result) {
                                $state.go('menu.chat', {chatId: chat._id});
                            }
                        });
                    } else {
                        var chatID = Chat.createChat(userId);
                        console.log('createChat() chatId: ' + chatID);
                        $state.go('menu.chat', {chatId: chatID});
                    }
                };
            }
        });
    })

    /**
     *  @summary Controller for loading information of each chat
     */
    .controller('chatInfoCtrl', function ($scope, Chat) {
        // Get last message
        var chat = $scope.chat;
        $scope.subscribe('Messages', () => {
            return [{chatId: chat._id, messageId: chat.lastMessage}];
        });

        $scope.helpers({
            // Load chat info
            chat: function () {
                return Chat.getOneChat(chat._id, function () {
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
        const chatId = $stateParams.chatId;
        const isIOS = ionic.Platform.isWebView() && ionic.Platform.isIOS();
        var initialLimit = 20;
        $scope.limit = 0;
        let preventAutoScroll = false;

        /**
         * Helper functions
         */
        $scope.helpers({
            chat: function () {
                return Chat.getOneChat(chatId, function () {
                    $scope.$apply();
                });
            },
            messages: function () {
                return Chat.getMessages(chatId);
            }
        });

        /**
         * Subscribes to messages
         */
        $scope.refresh = function (newLimit) {
            check(newLimit, Match.Maybe(Number));
            newLimit = newLimit || $scope.limit || initialLimit;
            const totalNrOfMessages = MessagesCount.find(chatId).fetch()[0].count;
            const nrOfLoadedMessages = $scope.messages.length;
            const nrOfUnloadedMessages = totalNrOfMessages - nrOfLoadedMessages;
            const nrOfMessagesToLoad = newLimit - $scope.limit;
            if(totalNrOfMessages > nrOfLoadedMessages) {
                $scope.limit = nrOfUnloadedMessages > nrOfMessagesToLoad
                    ? newLimit : $scope.limit + nrOfUnloadedMessages;
            } else {
                $scope.$broadcast('scroll.refreshComplete');
                return;
            }
            $scope.subscribe('Messages', () => {
                preventAutoScroll = true;
                return [{chatId: chatId, limit: $scope.limit}];
            }, () => {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        /**
         * Update total number of messages in the chat
         */
        $scope.subscribe('MessagesCount', () => { return [chatId] }, () => {
            // Subscribe to an initial set of messages
            $scope.refresh(); 
        });

        /**
         * Match senderID with Id of currently logged-in user
         * @param senderId String user Id
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
                if(preventAutoScroll) {
                    preventAutoScroll = false;
                    return;
                }
                $scope.scrollBottom(animate);
            });
        };

        $scope.autoScroll();
    })