import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './AccessControl';

let testPermissions;
let testPr;
let testPlayer;
let testCoach;
let testG;
let testType;
if (Meteor.isServer) {
    describe('Access Control Set Permissions', () => {
        it("PR user can set permissions", (done) => {
            testPr = {
                email: 'pr@pr.pr',
                password: 'pr',
                profile: {firstName: 'Pr', lastName: 'Pr', type: 'pr', clubID: 'test', notifications: new Object()}
            };

            testPlayer = {
                email: 'ur@ur.ur',
                password: 'ur',
                profile: {firstName: 'Ur', lastName: 'Ur', type: 'player', clubID: 'test', teamID: 'test', notifications: new Object()}
            };

            testCoach = {
                email: 'c@c.cc',
                password: 'cc',
                profile: {firstName: 'c', lastName: 'c', type: 'coach', clubID: 'test', teamID: 'test', notifications: new Object()}
            };
            testG = {
                email: 'g@g.gg',
                password: 'gg',
                profile: {firstName: 'g', lastName: 'g', type: 'general', clubID: 'test', notifications: new Object()}
            };

            Meteor.users.remove({});
            testPr._id = Accounts.createUser(testPr);
            // console.log("pr added: "+testPr._id);
            testPlayer._id = Accounts.createUser(testPlayer);
            // console.log("p added: " + testPlayer._id);
            testCoach._id = Accounts.createUser(testCoach);
            // console.log("c added: " + testCoach._id);
            testG._id = Accounts.createUser(testG);
            // console.log("g added: " + testG._id);

            // Create item without type
            testPermissions = {
                _id: 'pr',
                items: [{
                    _id: 'testType', permissions: {
                        create: true,
                        edit: true, view: true, delete: true
                    }
                }
                ]
            };

            testType = {
                _id: 'testType',
                name: 'testType',
                icon: 'testType.ClubNet'
            };


            try {
                AMx.remove({});
                TypesCollection.remove({});
                TypesCollection.insert(testType);
            } catch (err) {
                console.log("before: " + err);
            }

            Meteor.userId = sinon.stub().returns(testPr._id);
            Meteor.user = sinon.stub().returns(testPr);

            // Adding the custom type
            try {
                Meteor.call('setPermissions', testPermissions);
                done();
            } catch (err) {
                console.log('setPermissions: ' + err);
                assert.fail();
            } finally {
                Meteor.user.restore();
                Meteor.userId.restore();
            }
        });

        it("Player user cannot set permissions", (done) => {
            Meteor.userId = sinon.stub().returns(testPlayer._id);
            Meteor.user = sinon.stub().returns(testPlayer);

            // Adding the custom type
            try {
                Meteor.call('setPermissions', testPermissions);
                assert.fail();
            } catch (err) {
                done();
            } finally {
                Meteor.user.restore();
                Meteor.userId.restore();
            }
        });

        it("Coach user cannot set permissions", (done) => {
            Meteor.userId = sinon.stub().returns(testCoach._id);
            Meteor.user = sinon.stub().returns(testCoach);
            // Adding the custom type
            try {
                Meteor.call('setPermissions', testPermissions);
                assert.fail();
            } catch (err) {
                done();
            } finally {
                Meteor.user.restore();
                Meteor.userId.restore();
            }
        });

        it("General user cannot set permissions", (done) => {
            Meteor.userId = sinon.stub().returns(testG._id);
            Meteor.user = sinon.stub().returns(testG);
            // Adding the custom type
            try {
                Meteor.call('setPermissions', testPermissions);
                assert.fail();
            } catch (err) {
                done();
            } finally {
                Meteor.user.restore();
                Meteor.userId.restore();
            }
        });

        after(function() {
           Meteor.users.remove({});
        });
    });
}