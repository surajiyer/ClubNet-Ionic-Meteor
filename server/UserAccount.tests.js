import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './UserAccount';

let testUser;
let testProfile;
let testPr;
userId = '1';

/**
 * @summary Tests for methods in UserAccount.js
 * To run this, call meteor test --full-app --driver-package practicalmeteor:mocha
 */
if (Meteor.isServer) {
    describe('UserAccount', () => {
        beforeEach(() => {
            // Create the test user without a first name
            testUser = {
                email: 'test@test.test',
                password: 'test',
                profile: {
                    firstName: 'Test',
                    lastName: 'Test',
                    type: 'player',
                    clubID: 'test',
                    teamID: 'test',
                    notifications: {}
                }
            };

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

            // Create a fake PR user to add other users
            var userId = Accounts.createUser(testPr);
            check(userId, String);
            testPr._id = userId;
            sinon.stub(Accounts, 'sendEnrollmentEmail').returns(false);
            sinon.stub(global.Meteor, 'userId').returns(testPr._id);
            sinon.stub(global.Meteor, 'user').returns(testPr);
        });

        afterEach(() => {
            sinon.restore(global.Meteor.userId);
            sinon.restore(global.Meteor.user);
            sinon.restore(Accounts.sendEnrollmentEmail);
            Meteor.users.remove({});
        });

        describe('addUser()', () => {
            it("should throw error with incomplete profile information", (done) => {
                try {
                    // Adding the item without a firstName attribute in profile
                    delete testUser.profile.firstName;
                    Meteor.call('addUser', testUser);
                } catch (err) {
                    done();
                }

                // It should throw an error, if it does not, the test fails.
                assert.fail();
            });

            it("should succeed with complete information", () => {
                try {
                    // Add the testUser to the collection
                    var userId = Meteor.call('addUser', testUser);
                    check(userId, String);
                    testUser._id = userId;
                } catch (err) {
                    // If there is any error, test fails.
                    assert(false, err.message);
                }
            });
        });

        describe('updateUserProfile()', () => {
            beforeEach(() => {
                var userId = Accounts.createUser(testUser);
                check(userId, String);
                testUser._id = userId;
            });

            /**
             * @summary Updating a user with incomplete data throws error
             * It makes a testProfile with a incorrect lastName.
             * Then it tries to update the profile of the previous created user.
             * This should throw an error.
             */
            it("should throws error with incomplete data", (done) => {
                // Create a testProfile with a number for lastName
                testProfile = {
                    firstName: 'Test',
                    lastName: 14,
                    type: 'player',
                    clubID: 'test',
                    teamID: 'test',
                    notifications: {}
                };

                // Update the profile of the previous created user with the new testProfile
                try {
                    Meteor.call('updateUserProfile', testUser._id, testProfile);
                } catch (err) {
                    done();
                }

                // It should throw an error, if it does not, the test fails
                assert.fail();
            });

            it("should throws error with incomplete data", (done) => {
                // Create a testProfile with a number for lastName
                testProfile = {
                    firstName: 'Test',
                    lastName: 14,
                    type: 'player',
                    clubID: 'test',
                    teamID: 'test',
                    notifications: {}
                };

                // Update the profile of the previous created user with the new testProfile
                try {
                    Meteor.call('updateUserProfile', testUser._id, testProfile);
                } catch (err) {
                    done();
                }

                // It should throw an error, if it does not, the test fails
                assert.fail();
            });

            /**
             * @summary Updating a user with complete data succeeds
             * It updates the testProfile with the correct data.
             * Then it tries to update the profile of the previous created user.
             * This should succeed.
             */
            it("should succeed with complete data", () => {
                // Update the testProfile with the correct data
                testProfile.lastName = 'newTest';
                // Update the profile of the previous created user with the new testProfile
                try {
                    Meteor.call('updateUserProfile', testUser._id, testProfile);
                } catch (err) {
                    assert.fail(err.message);
                }
            });
        });

        describe('getUserInfo()', () => {
            beforeEach(() => {
                var userId = Accounts.createUser(testUser);
                check(userId, String);
                testUser._id = userId;
            });

            /**
             * @summary Getting user info with wrong parameters
             * It tries to get a user with a wrong parameter
             * This should throw error.
             */
            it("should throws error with non-String id", (done) => {
                // Get user with wrong parameter
                try {
                    Meteor.call('getUserInfo', 1234);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            /**
             * @summary Getting user info with non existing id
             * It tries to get a user that does not exist
             * This should throw error.
             */
            it("should throws error with non-existing string Id", () => {
                // Get user with id that does not exist
                try {
                    var result = Meteor.call('getUserInfo', 'test');
                    assert.isUndefined(result);
                } catch (err) {
                    assert(false, err.message);
                }
            });

            /**
             * @summary Getting user info with existing id.
             * It tries to get the user we previously created in the database
             * Then a couple of asserts to check whether this user is indeed the same
             * This should succeed.
             */
            it("should succeed with existing string id", () => {
                // Get user with correct id
                try {
                    var gettingUser = Meteor.call('getUserInfo', testUser._id);
                    // Checks to see whether the user is the same or not.
                    assert.equal(gettingUser.emails[0].address, testUser.email);
                    assert.equal(gettingUser.profile.firstName, testUser.profile.firstName);
                    assert.equal(gettingUser.profile.lastName, testUser.profile.lastName);
                    assert.equal(gettingUser.profile.type, testUser.profile.type);
                    assert.equal(gettingUser.profile.clubID, testUser.profile.clubID);
                } catch (err) {
                    assert(false, err.message);
                }
            });
        });

        describe('getUserInfo()', () => {
            beforeEach(() => {
                var userId = Accounts.createUser(testUser);
                check(userId, String);
                testUser._id = userId;
            });

            /**
             * @summary Getting user info with wrong parameters
             * It tries to get a user with a wrong parameter
             * This should throw error.
             */
            it("should throw error with non string id", (done) => {
                // Get user with wrong parameter
                try {
                    Meteor.call('getUserInfo', 1234);
                } catch (err) {
                    done();
                }

                // It should throw an error, if it does not, the test fails
                assert.fail();
            });

            /**
             * @summary Getting user info with non existing id
             * It tries to get a user that does not exist
             * This should throw error.
             */
            it("should throw error with non existing string id", () => {
                // Get user with id that does not exist
                try {
                    var user = Meteor.call('getUserInfo', 'test');
                    assert.isUndefined(user);
                } catch (err) {
                    assert(false, err.message);
                }
            });

            /**
             * @summary Getting user info with existing id.
             * It tries to get the user we previously created in the database
             * Then a couple of asserts to check whether this user is indeed the same
             * This should succeed.
             */
            it("should succeed with existing string id", () => {
                // Get user with correct id
                try {
                    var user = Meteor.call('getUserInfo', testUser._id);
                    // Checks to see whether the user is the same or not.
                    assert.equal(user.emails[0].address, testUser.email);
                    assert.equal(user.profile.firstName, testUser.profile.firstName);
                    assert.equal(user.profile.lastName, testUser.profile.lastName);
                    assert.equal(user.profile.type, testUser.profile.type);
                    assert.equal(user.profile.clubID, testUser.profile.clubID);
                } catch (err) {
                    assert(false, err.message);
                }
            });
        });

        describe('getUserType()', () => {
            /**
             * @summary Getting user type with wrong parameters
             * It tries to get a user with a wrong parameter
             * This should throw error.
             */
            it("should fail getting user type with incorrect id", (done) => {
                // Get user with wrong parameter
                global.Meteor.userId.returns(1234);
                try {
                    Meteor.call('getUserType');
                } catch (err) {
                    done();
                }

                // It should throw an error, if it does not, the test fails
                assert.fail();
            });

            /**
             * @summary Getting user type
             * It tries to get the type of the currently logged in user.
             * This should succeed.
             */
            it("should get user type", () => {
                // Get user with id that does not exist
                try {
                    var test = Meteor.call('getUserType');
                } catch (err) {
                    assert(false, err.message);
                }
                assert.equal(test, 'pr');
            });

        });

        describe('getTeamSize()', () => {
            beforeEach(() => {
                var userId = Accounts.createUser(testUser);
                check(userId, String);
                testUser._id = userId;
            });

            /**
             * @summary Getting team size of user without a team
             * It tries to get a the team size of a user that does not belong to a team
             * This should throw error.
             */
            it("should fail for non-existing team", () => {
                try {
                    result = Meteor.call('getTeamSize');
                } catch (err) {
                    assert.fail(err.message);
                }

                // Result must be 0 for users without teamID
                assert.equal(result, 0);
            });

            /**
             * @summary Getting team size of user with a team
             * It tries to get the team size of the currently logged in user
             * This should succeed.
             */
            it("should get team size", () => {
                // Get user with id that does not exist
                try {
                    global.Meteor.userId.returns(testUser._id);
                    result = Meteor.call('getTeamSize');
                } catch (err) {
                    assert(false, err.message);
                }
                assert.equal(result, 1);
            });
        });

        describe('Meteor.users.remove()', () => {
            beforeEach(() => {
                var userId = Accounts.createUser(testUser);
                check(userId, String);
                testUser._id = userId;
            });

            /**
             * @summary Deleting a user with existing id.
             * It tries to remove the previously created user.
             * This should succeed.
             */
            it("should delete user with existing id", () => {
                // Remove the user from the collection
                try {
                    Meteor.users.remove(testUser._id);
                    // should not be possible to get user info anymore
                    var user = Meteor.call('getUserInfo', testUser._id);
                    assert.isUndefined(user);
                } catch (err) {
                    assert(false, err.message);
                }
            });
        });
    });
}