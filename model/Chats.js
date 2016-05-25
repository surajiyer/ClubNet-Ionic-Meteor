import {chats, chatSessions, messages} from '/imports/schemas/chats';

Chats = new Mongo.Collection("Chats");
//ChatSessions = new Mongo.Collection("ChatSessions");
Messages = new Mongo.Collection("Messages");

Meteor.startup(function () {
    Chats.allow({
        insert: function (userId) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Chat', 'create');
            return isValidUser && hasPermission;
        },
        update: function (userId, doc) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Chat', 'edit');
            return isValidUser && hasPermission;
        },
        remove: function (userId, doc) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Chat', 'delete');
            var allowed = isValidUser && hasPermission;
            if(allowed) {
                Messages.remove({chatID: doc._id});
            }
            return allowed;
        }
    });

    Messages.allow({
        insert: function (userId) {
            var isValidUser = userId == this.userId;
            return isValidUser;
        },
        update: function (userId) {
            return false;
        },
        remove: function (userId) {
            var isValidUser = userId == this.userId;
            var hasPermission = Meteor.call('checkRights', 'Messages', 'delete');
            return isValidUser && hasPermission;
        }
    });

    // Attach the schemas
    Chats.attachSchema(chats);
    //ChatSessions.attachSchema(chatSessions);
    Messages.attachSchema(messages);
});

if (Meteor.isServer) {
    Meteor.publish('Chats', function () {
        return Chats.find({users: this.userId});
    });

    Meteor.publish('Messages', function (chatId) {
        return Messages.find({chatID: chatId});
    });
}