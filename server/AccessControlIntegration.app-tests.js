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

// var FeedPublish = sinon.spy(Meteor, 'publish');
//
// console.log(FeedPublish);

if (Meteor.isServer) {
    describe('Access Control Integration Test', () => {
        before(() => {
            // Reset database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});

            // Create fake item types
            let Voting = {
                _id: 'Voting',
                name: 'Voting form',
                icon: 'Voting.ClubNet'
            };
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

        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});
        });

        describe('PR user inserts access control for all users', () => {
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
                    AMx.insert(testControlG);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('Coach user wants to create a voting item', () => {
            before(() => {
                // Stub Meteor.user as coach user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should be allowed to create a voting item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');
                    assert.equal(permission, true);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            it("should create a voting item", () => {
                // Remove the user from the collection
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
                // Stub Meteor.user as coach user
                Meteor.userId = sinon.stub().returns(testPlayer._id);
                Meteor.user = sinon.stub().returns(testPlayer);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should be allowed to view a voting item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should view the voting item", () => {
                // Remove the user from the collection
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
                // Stub Meteor.user as coach user
                Meteor.userId = sinon.stub().returns(testGeneral._id);
                Meteor.user = sinon.stub().returns(testGeneral);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should not be allowed to view a voting item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('PR user changes access control for a Player user', () => {
            before(() => {
                // Stub Meteor.user as PR user
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("Should insert successfully, without create rights", () => {
                // Remove the user from the collection
                testControlP = {
                    _id: 'player',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }]
                };

                try {
                    AMx.remove({_id: 'player'});
                    AMx.insert(testControlP);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Player user now wants to view the voting item', () => {
            before(() => {
                // Stub Meteor.user as coach user
                Meteor.userId = sinon.stub().returns(testPlayer._id);
                Meteor.user = sinon.stub().returns(testPlayer);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should not be allowed to see the voting item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('PR user changes access control for a Coach user', () => {
            before(() => {
                // Stub Meteor.user as PR user
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("Should insert successfully, without create rights", () => {
                // Remove the user from the collection
                testControlC = {
                    _id: 'coach',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: true, view: true, delete: true}
                    }]
                };
                
                try {
                    AMx.remove({_id: 'coach'});
                    AMx.insert(testControlC);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Coach user now wants to create a voting item', () => {
            before(() => {
                // Stub Meteor.user as coach user
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should not be allowed to create a voting item", () => {
                // Remove the user from the collection
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