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


if (Meteor.isServer) {
    describe('Chat Integration Test', () => {
        // In the before, the database is reset
        // And the needed accounts and environment details are set up
        before(() => {
            // Reset database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});

            // Create fake item type for chat
            let Chat = {
                _id: 'Chat',
                name: 'Chat form',
                icon: 'Chat.ClubNet'
            };
            // Create it in the database
            TypesCollection.insert(Chat);

            // Create fake item type for messages
            let Messages = {
                _id: 'Messages',
                name: 'Messages form',
                icon: 'Messages.ClubNet'
            };
            // Create it in the database
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
            // Create it in the database
            testPr._id = Accounts.createUser(testPr);

            // Create a fake coach user
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
            // Create it in the database
            testCoach._id = Accounts.createUser(testCoach);

            // Create a fake player user
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
            // Create it in the database
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

        // In the after, the database is again reset
        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});
        });

        describe('PR user inserts access control for chat users', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Inserting access control with complete data succeeds
             * It uses the access controls created in the before
             * Then it tries to insert these into the AMx collection
             * This should succeed.
             */
            it("Should insert successfully ", () => {
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
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Checking rights in the database should succeed
             * It calls the database to see whether or not the user is allowed the action
             * Then it checks whether or not the value is the expected value
             * This should succeed.
             */
            it("should be allowed to start a chat", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Chat', 'create');
                    assert.equal(permission, true);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            /**
             * @summary Creating a chat in the database should succeed
             * It uses the id's of the coach and the player created in the before
             * Then it tries to insert this in the chats collection
             * And it checks whether or not it actually got an id returned
             * This should succeed.
             */
            it("should start a chat with a player", () => {
                try {
                    chatId = Chats.insert({users: [testCoach._id, testPlayer._id]});
                    check(chatId, String);
                } catch (err) {
                    assert.fail();
                }
            });

            /**
             * @summary Creating a message in the database should succeed
             * It uses the id of the just created chat
             * Then it tries to insert this in the messages collection together with a personal message
             * And it checks whether or not it actually got an id returned
             * This should succeed.
             */
            it("should send a message to a player in the just started chat", () => {
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
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Checking rights in the database should succeed
             * It calls the database to see whether or not the user is allowed the action
             * Then it checks whether or not the value is the expected value
             * This should succeed.
             */
            it("should be allowed to view the chat", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Chat', 'view');
                    assert.equal(permission, true);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            /**
             * @summary Retrieving messages from in the database should succeed
             * It calls the database to retrieve the messages corresponding to the chatID
             * Then it checks whether or not the message returned is the correct message
             * This should succeed.
             */
            it("should be able to see the coach send message", () => {
                // Remove the user from the collection
                try {
                    var messages = Messages.find({chatID: chatId}, {sort: {createdAt: 1}}).fetch()[0];
                    assert.equal(messages.message, 'Text to player');
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            /**
             * @summary Creating a message in the database should succeed
             * It uses the id of the just created chat
             * Then it tries to insert this in the messages collection together with a personal message
             * And it checks whether or not it actually got an id returned
             * This should succeed.
             */
            it("should be able to send a message to the coach in the just started chat", () => {
                try {
                    // Add the message to the database
                    var messageId = Messages.insert({chatID: chatId, message: 'Text to coach'});
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

        describe('Coach user wants to see the chat', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Retrieving messages from in the database should succeed
             * It calls the database to retrieve the messages corresponding to the chatID
             * Then it checks whether or not the message returned is the correct message
             * This should succeed.
             */
            it("should be able to see the player send message", () => {
                try {
                    var messages = Messages.find({chatID: chatId}, {sort: {createdAt: 1}}).fetch()[1];
                    assert.equal(messages.message, 'Text to coach');
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('PR user changes access control for Player and Coach user', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Inserting access control with complete data succeeds
             * It creates new access controls with different permissions
             * Then it tries to insert these into the AMx collection
             * This should succeed.
             */
            it("Should insert successfully", () => {
                // Coach user permissions
                testControlC = {
                    _id: 'coach',
                    items: [{
                        _id: 'Chat',
                        permissions: {create: false, edit: true, view: true, delete: true}
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
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }, {
                        _id: 'Messages',
                        permissions: {create: true, edit: true, view: true, delete: true}
                    }]
                };
                // First remove the previous permissions, then insert the new ones
                try {
                    AMx.remove({_id: 'coach'});
                    AMx.remove({_id: 'player'});
                    AMx.insert(testControlC);
                    AMx.insert(testControlP);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Coach user now wants to create a chat', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Checking rights in the database should succeed
             * It calls the database to see whether or not the user is allowed the action
             * Then it checks whether or not the value is the expected value
             * This should succeed.
             */
            it("should not be allowed to start a chat", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Chat', 'create');
                    assert.equal(permission, false);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('Player user now wants to view the chat', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testPlayer._id);
                Meteor.user = sinon.stub().returns(testPlayer);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Checking rights in the database should succeed
             * It calls the database to see whether or not the user is allowed the action
             * Then it checks whether or not the value is the expected value
             * This should succeed.
             */
            it("should not be allowed to view the chat", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Chat', 'view');
                    assert.equal(permission, false);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });
    });
}