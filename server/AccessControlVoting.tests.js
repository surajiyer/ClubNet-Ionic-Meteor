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
let Voting;
let Form;
if (Meteor.isServer) {
    describe('Access Control Voting', () => {

        describe('PR user', () => {
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
                testControlPr = {
                    _id: 'pr',
                    items: [{
                        _id: 'Voting', permissions: {
                            create: true,
                            edit: true, view: true, delete: true
                        }
                    },
                        {
                            _id: 'Form', permissions: {
                            create: true,
                            edit: true, view: true, delete: true
                        }
                        }
                    ]
                };

                // Create item without type
                testControlP = {
                    _id: 'player',
                    items: [{
                        _id: 'Voting', permissions: {
                            create: false,
                            edit: false, view: true, delete: false
                        }
                    },
                        {
                            _id: 'Form', permissions: {
                            create: true,
                            edit: true, view: true, delete: true
                        }
                        }
                    ]
                };

                // Create item without type
                testControlC = {
                    _id: 'coach',
                    items: [{
                        _id: 'Voting', permissions: {
                            create: true,
                            edit: true, view: true, delete: true
                        }
                    },
                        {
                            _id: 'Form', permissions: {
                            create: true,
                            edit: true, view: true, delete: true
                        }
                        }
                    ]
                };

                // Create item without type
                testControlG = {
                    _id: 'general',
                    items: [{
                        _id: 'Voting', permissions: {
                            create: false,
                            edit: false, view: false, delete: false
                        }
                    },
                        {
                            _id: 'Form', permissions: {
                            create: false,
                            edit: false, view: false, delete: false
                        }
                        }
                    ]
                };

                Voting = {
                    _id: 'Voting',
                    name: 'Voting',
                    icon: 'Voting.ClubNet'
                };

                // Create item without type
                Form = {
                    _id: 'Form',
                    name: 'Form',
                    icon: 'Form.ClubNet'
                };

                try {
                    AMx.remove({});
                    TypesCollection.remove({});
                    TypesCollection.insert(Voting);
                    TypesCollection.insert(Form);
                } catch (err) {
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

            it("PR user is able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');

                    // Should succeed
                    done();
                } catch (err) {
                    console.log('err: ' + err);
                    assert.fail();
                }
            });

            it("PR user is able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("PR user is able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("PR user is able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Player user', () => {
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

            it("Player user is not able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("Player user is not able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("Player user is able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("Player user is not able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Coach user', () => {
            it("Set permissions for Coach user a Voting item", (done) => {

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

            it("Coach user is able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("Coach user is able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("Coach user is able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("Coach user is able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('General user', () => {
            it("Set permissions for General user a Voting item", (done) => {

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

            it("General user is not able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("General user is not able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("General user is not able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');

                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("General user is not able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');

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
    });
}