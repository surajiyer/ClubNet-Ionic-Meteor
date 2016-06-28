import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './AccessControl';
import './ItemTypes';
import '../model/Chats';


let testPr;
let testCoach;
let testPlayer;
let testControlC;
let testControlP;
let chatId;

var ChatsAllowSpy = sinon.spy(Chats, 'allow');

if (Meteor.isServer) {
    describe('Chat Integration Test', () => {
        var allow;
        before(() => {
            // Reset database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});

            allow = ChatsAllowSpy.getCall(0).args[0];

            // Create fake item types
            let Chat = {
                _id: 'Chat',
                name: 'Chat form',
                icon: 'Chat.ClubNet'
            };
            TypesCollection.insert(Chat);

            let Messages = {
                _id: 'Messages',
                name: 'Messages form',
                icon: 'Messages.ClubNet'
            };
            TypesCollection.insert(Messages);

            // Create a fake PR user
            testPr = {
                email: 'pr@pr.pr',
                password: 'pr',
                profile: {
                    firstName: 'Pr',
                    lastName: 'Pr',
                    type: 'pr',
                    clubID: 'test',
                    notifications: {}
                }
            };
            testPr._id = Accounts.createUser(testPr);

            testCoach = {
                email: 'c@c.cc',
                password: 'cc',
                profile: {
                    firstName: 'c',
                    lastName: 'c',
                    type: 'coach',
                    clubID: 'test',
                    teamID: 'test',
                    notifications: {}
                }
            };
            testCoach._id = Accounts.createUser(testCoach);

            testPlayer = {
                email: 'ur@ur.ur',
                password: 'ur',
                profile: {
                    firstName: 'Ur',
                    lastName: 'Ur',
                    type: 'player',
                    clubID: 'test',
                    teamID: 'test',
                    notifications: {}
                }
            };
            testPlayer._id = Accounts.createUser(testPlayer);

            // Coach user permissions
            testControlC = {
                _id: 'coach',
                items: [{
                    _id: 'Chat',
                    permissions: {create: true, edit: true, view: true, delete: true}
                }, {
                    _id: 'Messages',
                    permissions: {create: true, edit: true, view: true, delete: true}
                }]
            };

            // Player user permissions
            testControlP = {
                _id: 'player',
                items: [{
                    _id: 'Chat',
                    permissions: {create: false, edit: false, view: true, delete: false}
                }, {
                    _id: 'Messages',
                    permissions: {create: true, edit: true, view: true, delete: true}
                }]
            };
        });

        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});
        });

        describe('PR user inserts access control for chat users', () => {
            before(() => {
                // Stub Meteor.user as PR user
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("Should insert successfully ", () => {
                // Remove the user from the collection
                try {
                    AMx.insert(testControlC);
                    AMx.insert(testControlP);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('Coach user wants to start a chat', () => {
            before(() => {
                // Stub Meteor.user as coach user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should be allowed to start a chat", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Chat', 'create');
                    assert.equal(permission, true);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            it("should start a chat with a player", () => {
                // Remove the user from the collection
                try {
                    chatId = Chats.insert({users: [testCoach._id, testPlayer._id]});
                } catch (err) {
                    assert.fail();
                }
            });

            it("should send a message to a player in the just started chat", () => {
                // Remove the user from the collection
                try {
                    // Add the message to the database
                    var messageId = Messages.insert({chatID: chatId, message: 'Text to player'});
                    console.log('messageId: ' + messageId);
                    // If added correctly, update last message of chat
                    if (messageId) {
                        Chats.update(chatId, {$set: {lastMessage: messageId}});
                    }
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Player user wants to see the chat', () => {
            before(() => {
                // Stub Meteor.user as coach user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should be allowed to view the chat", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Chat', 'view');
                    assert.equal(permission, true);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            it("should be able to see the messages", () => {
                // Remove the user from the collection
                try {
                    console.log('chatID: ' + chatId);
                    var messages = Messages.find({chatID: chatId}, {sort: {createdAt: 1}});
                    assert.fail();
                    console.log(messages);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });
    });
}