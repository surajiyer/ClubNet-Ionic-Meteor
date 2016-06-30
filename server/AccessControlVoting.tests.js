import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './AccessControl';
import './ItemTypes';

if (Meteor.isServer) {
    describe('Access Control Form', () => {
        before(() => {
            // Reset database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});

            // Create fake item types
            let Voting = {
                _id: 'Voting',
                name: 'Exercise poll',
                icon: 'Voting.ClubNet'
            };
            TypesCollection.insert(Voting);
        });

        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});
        });

        describe('PR user', () => {
            before(() => {
                // Create a fake PR user
                let testPr = {
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

                // Create fake Access control
                let testControlPr = {
                    _id: 'pr',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }]
                };

                // Stub Meteor.user as PR user
                sinon.stub(global.Meteor, 'userId').returns(testPr._id);
                sinon.stub(global.Meteor, 'user').returns(testPr);

                // Add PR user permissions
                AMx.insert(testControlPr);
            });

            after(() => {
                sinon.restore(global.Meteor.user);
                sinon.restore(global.Meteor.userId);
            });

            it("should not be able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    console.log('err: ' + err);
                    assert.fail();
                }
            });

            it("should not be able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Player user', () => {
            before(() => {
                let testPlayer = {
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
                // console.log("p added: " + testPlayer._id);

                // Player user permissions
                let testControlP = {
                    _id: 'player',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: false, view: true, delete: false}
                    }]
                };

                // Stub Meteor.user as player user
                sinon.stub(global.Meteor, 'userId').returns(testPlayer._id);
                sinon.stub(global.Meteor, 'user').returns(testPlayer);

                // Add Player user permissions
                AMx.insert(testControlP);
            });

            after(() => {
                sinon.restore(global.Meteor.user);
                sinon.restore(global.Meteor.userId);
            });

            it("should not be able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, true);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Coach user', () => {
            before(() => {
                let testCoach = {
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
                // console.log("c added: " + testCoach._id);

                // Coach user permissions
                let testControlC = {
                    _id: 'coach',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: true, edit: true, view: true, delete: true}
                    }]
                };

                // Stub Meteor.user as coach user
                sinon.stub(global.Meteor, 'userId').returns(testCoach._id);
                sinon.stub(global.Meteor, 'user').returns(testCoach);

                // Add Coach user permissions
                AMx.insert(testControlC);
            });

            after(() => {
                sinon.restore(global.Meteor.user);
                sinon.restore(global.Meteor.userId);
            });

            it("should be able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');
                    assert.equal(permission, true);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');
                    assert.equal(permission, true);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, true);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');
                    assert.equal(permission, true);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('General user', () => {
            before(() => {
                let testG = {
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

                testG._id = Accounts.createUser(testG);

                // General member permissions
                let testControlG = {
                    _id: 'general',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }]
                };

                // Stub Meteor.user as general user
                sinon.stub(global.Meteor, 'userId').returns(testG._id);
                sinon.stub(global.Meteor, 'user').returns(testG);

                // Add General user permissions
                AMx.insert(testControlG);
            });

            after(() => {
                sinon.restore(global.Meteor.user);
                sinon.restore(global.Meteor.userId);
            });

            it("should not be able to create a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'create');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to edit a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'edit');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to view a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'view');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to delete a Voting item", (done) => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Voting', 'delete');
                    assert.equal(permission, false);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });
    });
}