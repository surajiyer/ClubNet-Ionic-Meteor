import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './AccessControl';

let testPr, testPlayer, testCoach, testG;
let testPermissions, testType;

if (Meteor.isServer) {
    describe('Access Control Set Permissions', () => {
        before(() => {
            // Reset database
            Meteor.users.remove({});
            AMx.remove({});

            // Create fake item types
            testType = {
                _id: 'testType',
                name: 'testType',
                icon: 'testType.ClubNet'
            };
            TypesCollection.insert(testType);

            // Create fake users
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
            testG = {
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

            testPr._id = Accounts.createUser(testPr);
            testPlayer._id = Accounts.createUser(testPlayer);
            testCoach._id = Accounts.createUser(testCoach);
            testG._id = Accounts.createUser(testG);

            testPermissions = {
                _id: 'pr',
                items: [{
                    _id: 'testType',
                    permissions: {
                        create: true,
                        edit: true,
                        view: true,
                        delete: true
                    }
                }]
            };
        });

        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
        });

        afterEach(() => {
            sinon.restore(Meteor.user);
            sinon.restore(Meteor.userId);
        });

        it("should allow a PR user to set permissions", () => {
            Meteor.userId = sinon.stub().returns(testPr._id);
            Meteor.user = sinon.stub().returns(testPr);

            try {
                Meteor.call('setPermissions', testPermissions);
            } catch (err) {
                assert.fail();
            }
        });

        it("should not allow a Player user to set permissions", (done) => {
            Meteor.userId = sinon.stub().returns(testPlayer._id);
            Meteor.user = sinon.stub().returns(testPlayer);

            try {
                Meteor.call('setPermissions', testPermissions);
                assert.fail();
            } catch (err) {
                done();
            }
        });

        it("should not allow a Coach user to set permissions", (done) => {
            Meteor.userId = sinon.stub().returns(testCoach._id);
            Meteor.user = sinon.stub().returns(testCoach);

            try {
                Meteor.call('setPermissions', testPermissions);
                assert.fail();
            } catch (err) {
                done();
            }
        });

        it("should not allow a General user to set permissions", (done) => {
            Meteor.userId = sinon.stub().returns(testG._id);
            Meteor.user = sinon.stub().returns(testG);

            try {
                Meteor.call('setPermissions', testPermissions);
                assert.fail();
            } catch (err) {
                done();
            }
        });
    });
}