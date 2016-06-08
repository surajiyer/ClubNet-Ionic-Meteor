import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import {accessControlSchema} from '/imports/schemas/misc';
import './AccessControl.js';

let testPermissions;
let testPr;
let testPlayer;
let testCoach;
let testG;
let testType;
if (Meteor.isServer) {
    describe('Access Control Set Permissions', () => {


        it("PR user can set permissions", (done) => {

            // Add schema to Items
            AMx.attachSchema(accessControlSchema);

            testPr = {
                email: 'pr@pr.pr',
                password: 'pr',
                profile: {firstName: 'Pr', lastName: 'Pr', type: 'pr', clubID: 'test'}
            };

            testPlayer = {
                email: 'ur@ur.ur',
                password: 'ur',
                profile: {firstName: 'Ur', lastName: 'Ur', type: 'player', clubID: 'test'}
            };

            testCoach = {
                email: 'c@c.cc',
                password: 'cc',
                profile: {firstName: 'c', lastName: 'c', type: 'coach', clubID: 'test'}
            };
            testG = {
                email: 'g@g.gg',
                password: 'gg',
                profile: {firstName: 'g', lastName: 'g', type: 'general', clubID: 'test'}
            };

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
                items: [{_id: 'testType', permissions: {create: true,
                    edit: true, view: true, delete: true}}
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
            } catch(err) {
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
            }
        });


        /**
         * @summary Deleting the PR user.
         * It tries to remove the previously created PR user.
         * This should succeed.
         */
        it("Reset the database", (done) => {
            // Remove the user from the collection
            try {
                AMx.remove(testPermissions);
                Meteor.users.remove(testPr._id);
                Meteor.users.remove(testPlayer._id);
                Meteor.users.remove(testCoach._id);
                Meteor.users.remove(testG._id);
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

    });
}