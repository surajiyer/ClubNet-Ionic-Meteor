import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import {accessControlSchema} from '/imports/schemas/misc';
import './AccessControl.js';

let testControlPr;
let testControlP;
let testControlC;
let testControlG;
let testPr;
let testPlayer;
let testCoach;
let testG;
let voting;
let practicalities;
if (Meteor.isServer) {
    describe('Access Control Voting', () => {
        
        
        it("Set permissions for PR user", (done) => {

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
            testControlPr = {
                _id: 'pr',
                items: [{_id: 'voting', permissions: {create: true,
                    edit: true, view: true, delete: true}},
                    {_id: 'practicalities', permissions: {create: true,
                        edit: true, view: true, delete: true}}
                ]
            };

            // Create item without type
            testControlP = {
                _id: 'player',
                items: [{_id: 'voting', permissions: {create: false,
                    edit: false, view: true, delete: false}},
                    {_id: 'practicalities', permissions: {create: true,
                        edit: true, view: true, delete: true}}
                ]
            };

            // Create item without type
            testControlC = {
                _id: 'coach',
                items: [{_id: 'voting', permissions: {create: true,
                    edit: true, view: true, delete: true}},
                    {_id: 'practicalities', permissions: {create: true,
                        edit: true, view: true, delete: true}}
                ]
            };

            // Create item without type
            testControlG = {
                _id: 'general',
                items: [{_id: 'voting', permissions: {create: false,
                    edit: false, view: false, delete: false}},
                    {_id: 'practicalities', permissions: {create: false,
                        edit: false, view: false, delete: false}}
                ]
            };
            
            voting = {
                _id: 'voting',
                name: 'voting',
                icon: 'voting.ClubNet'
            };

            // Create item without type
            practicalities = {
                _id: 'practicalities',
                name: 'practicalities',
                icon: 'practicalities.ClubNet'
            };

            try {
                AMx.remove({});
                TypesCollection.remove({});
                TypesCollection.insert(voting);
                TypesCollection.insert(practicalities);
            } catch(err) {
                console.log("before: " + err);
            }

            Meteor.userId = sinon.stub().returns(testPr._id);
            Meteor.user = sinon.stub().returns(testPr);

            // Adding the custom type
            try {
                Meteor.call('setPermissions', testControlPr);
                done();
            } catch (err) {
                console.log('setPermissions: ' + err);
                assert.fail();
            }
        });

        it("PR user is able to create a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'create');
                
                // Should succeed
                done();
            } catch (err) {
                console.log('err: '+err);
                assert.fail();
            }
        });

        it("PR user is able to edit a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'edit');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("PR user is able to view a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'view');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("PR user is able to delete a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'delete');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Set permissions for Player user", (done) => {

            Meteor.userId = sinon.stub().returns(testPr._id);
            Meteor.user = sinon.stub().returns(testPr);

            // Adding the custom type
            try {
                Meteor.call('setPermissions', testControlP);
                Meteor.userId = sinon.stub().returns(testPlayer._id);
                Meteor.user = sinon.stub().returns(testPlayer);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Player user is not able to create a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'create');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Player user is not able to edit a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'edit');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Player user is able to view a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'view');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Player user is not able to delete a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'delete');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });


        it("Set permissions for Coach user a voting item", (done) => {
            
            Meteor.userId = sinon.stub().returns(testPr._id);
            Meteor.user = sinon.stub().returns(testPr);
            // Adding the custom type
            try {
                Meteor.call('setPermissions', testControlC);
                Meteor.userId = sinon.stub().returns(testCoach._id);
                Meteor.user = sinon.stub().returns(testCoach);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Coach user is able to create a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'create');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Coach user is able to edit a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'edit');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Coach user is able to view a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'view');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Coach user is able to delete a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'delete');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Set permissions for General user a voting item", (done) => {

            Meteor.userId = sinon.stub().returns(testPr._id);
            Meteor.user = sinon.stub().returns(testPr);
            // Adding the custom type
            try {
                Meteor.call('setPermissions', testControlG);
                Meteor.userId = sinon.stub().returns(testG._id);
                Meteor.user = sinon.stub().returns(testG);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("General user is not able to create a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'create');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("General user is not able to edit a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'edit');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("General user is not able to view a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'view');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("General user is not able to delete a voting item", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'voting', 'delete');
                
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
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