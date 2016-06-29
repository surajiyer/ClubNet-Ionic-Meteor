import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './AccessControl';
import './ItemTypes';
import '../model/Feed';
import '../model/feedItems/Voting';

let testPr;
let testCoach;
let testPlayer;
let testGeneral;
let testControlC;
let testControlP;
let testControlG;
let testItem;

if (Meteor.isServer) {
    describe('Access Control Integration Test', () => {
        // In the before, the database is reset
        // And the needed accounts and environment details are set up
        before(() => {
            // Reset database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});

            // Create fake item type for voting
            let Voting = {
                _id: 'Voting',
                name: 'Voting form',
                icon: 'Voting.ClubNet'
            };
            // Create it in the database
            TypesCollection.insert(Voting);

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

            // Create a fake general user
            testGeneral = {
                email: 'g@g.gg',
                password: 'gg',
                profile: {
                    firstName: 'g',
                    lastName: 'g',
                    type: 'general',
                    clubID: 'test',
                    notifications: {}
                }
            };
            // Create it in the database
            testGeneral._id = Accounts.createUser(testGeneral);

            // Coach user permissions
            testControlC = {
                _id: 'coach',
                items: [{
                    _id: 'Voting',
                    permissions: {create: true, edit: true, view: true, delete: true}
                }]
            };

            // Player user permissions
            testControlP = {
                _id: 'player',
                items: [{
                    _id: 'Voting',
                    permissions: {create: false, edit: false, view: true, delete: false}
                }]
            };

            // General user permissions
            testControlG = {
                _id: 'general',
                items: [{
                    _id: 'Voting',
                    permissions: {create: false, edit: false, view: false, delete: false}
                }]
            };

            // Test item used for the tests
            testItem = {
                creatorID: testCoach._id,
                type: 'Voting',
                sticky: false,
                clubID: 'test',
                createdAt: new Date,
                modifiedAt: new Date,
                title: '1',
                status: 'published',
                deadline: new Date,
                training_id: '1',
                teamID: 'test'
            };
        });

        // In the after, the database is again reset
        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});
        });

        describe('PR user inserts access control for all users', () => {
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
                    AMx.insert(testControlG);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('Coach user wants to create a voting item', () => {
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
            it("should be allowed to create a voting item", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');
                    assert.equal(permission, true);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            /**
             * @summary Creating a feed item in the database should succeed
             * It uses the testItem created in the before
             * Then it tries to insert this by means of the addFeedItem method
             * And it checks whether or not it actually got an id returned
             * This should succeed.
             */
            it("should create a voting item", () => {
                try {
                    var itemId = Meteor.call('addFeedItem', testItem);
                    check(itemId, String);
                    testItem._id = itemId;
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('Player user wants to view the voting item', () => {
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
            it("should be allowed to view a voting item", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            /**
             * @summary Getting a feed item in the database should succeed
             * It uses the id of the testItem created inserted
             * Then it tries to get this testItem by means of the getFeedItem method
             * And it checks whether or not this result is the same as the testItem
             * This should succeed.
             */
            it("should view the voting item", () => {
                try {
                    var result = Meteor.call('getFeedItem', testItem._id);
                    assert.equal(result._id, testItem._id);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('General user wants to view the voting item', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testGeneral._id);
                Meteor.user = sinon.stub().returns(testGeneral);
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
            it("should not be allowed to view a voting item", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, false);
                } catch (err) {
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
            it("Should insert successfully, without create rights", () => {
                // Player user permissions
                testControlP = {
                    _id: 'player',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }]
                };
                // Coach user permissions
                testControlC = {
                    _id: 'coach',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: true, view: true, delete: true}
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

        describe('Player user now wants to view the voting item', () => {
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
            it("should not be allowed to see the voting item", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Coach user now wants to create a voting item', () => {
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
            it("should not be allowed to create a voting item", () => {
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });
        });

    });
}