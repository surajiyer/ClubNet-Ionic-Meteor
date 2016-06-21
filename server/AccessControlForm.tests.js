import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './AccessControl';

let testPr;

if (Meteor.isServer) {
    describe('Access Control Form', () => {
        before(() => {
            // Reset database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});

            // Create a fake PR user
            testPr = {
                email: 'pr@pr.pr',
                password: 'pr',
                profile: {
                    firstName: 'Pr',
                    lastName: 'Pr',
                    type: 'pr',
                    clubID: 'test',
                    notifications: new Object()
                }
            };
            testPr._id = Accounts.createUser(testPr);
            // console.log("pr added: "+testPr._id);

            // Create fake item types
            let Voting = {
                _id: 'Voting',
                name: 'Exercise poll',
                icon: 'Voting.ClubNet'
            };
            let Form = {
                _id: 'Form',
                name: 'Practicality form',
                icon: 'Form.ClubNet'
            };
            TypesCollection.insert(Voting);
            TypesCollection.insert(Form);
        });

        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});
        });

        describe('PR user', () => {
            before(() => {
                // Create fake Access control
                let testControlPr = {
                    _id: 'pr',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }, {
                        _id: 'Form',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }]
                };

                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);

                // Add PR user permissions
                AMx.insert(testControlPr);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should be able to create a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'create');
                    assert.equal(permission, true);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            it("should be able to edit a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'edit');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to view a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'view');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be to delete a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'delete');
                    assert.equal(permission, true);
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
                        notifications: new Object()
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
                    }, {
                        _id: 'Form',
                        permissions: {create: true, edit: true, view: true, delete: true}
                    }]
                };

                // Add Player user permissions
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
                AMx.insert(testControlP);

                // Stub Meteor.user as player user
                Meteor.userId.returns(testPlayer._id);
                Meteor.user.returns(testPlayer);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should not be able to create a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'create');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to edit a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'edit');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to view a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'view');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to delete a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'delete');
                    assert.equal(permission, false);
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
                        notifications: new Object()
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
                    }, {
                        _id: 'Form',
                        permissions: {create: true, edit: true, view: true, delete: true}
                    }]
                };

                // Add Coach user permissions
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
                AMx.insert(testControlC);

                // Stub Meteor.user as cpach user
                Meteor.userId.returns(testCoach._id);
                Meteor.user.returns(testCoach);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should be able to create a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'create');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to edit a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'edit');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to view a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'view');
                    assert.equal(permission, true);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should be able to delete a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'delete');
                    assert.equal(permission, true);
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
                        notifications: new Object()
                    }
                };

                testG._id = Accounts.createUser(testG);
                // console.log("g added: " + testG._id);

                // General member permissions
                let testControlG = {
                    _id: 'general',
                    items: [{
                        _id: 'Voting',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }, {
                        _id: 'Form',
                        permissions: {create: false, edit: false, view: false, delete: false}
                    }]
                };

                // Add General user permissions
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
                AMx.insert(testControlG);

                // Stub Meteor.user as general user
                Meteor.userId.returns(testG._id);
                Meteor.user.returns(testG);
            });

            after(() => {
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            it("should not be able to create a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'create');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to edit a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'edit');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to view a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'view');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });

            it("should not be able to delete a Form item", () => {
                // Remove the user from the collection
                try {
                    var permission = Meteor.call('checkRights', 'Form', 'delete');
                    assert.equal(permission, false);
                } catch (err) {
                    assert.fail();
                }
            });
        });
    });
}