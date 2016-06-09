import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import {isAdmin} from '/imports/common';
import {userSchema, userProfileSchema} from '/imports/schemas/users';
import {notesSchema} from '/imports/schemas/misc';
import './UserAccount.js';
/**
 * @summary Tests for methods in UserAccount.js
 * To run this, call meteor test --full-app --driver-package practicalmeteor:mocha
 */

if (Meteor.isServer) {
    let testUser;
    let testProfile;
    let testPr;
    userId = '1';
    describe('UserAccount', () => {

        describe('addUser()', () => {
            /**
             * @summary Adding a user with incomplete data throws error
             * This sets up the environment for all the following test cases.
             * It makes a testUser without a firstName and then tries to add it to the users collection.
             * This should throw an error.
             */
            it("Adding user with incomplete data throws error", (done) => {

                // Add schema to the users collection
                Meteor.users.attachSchema(userSchema);

                // Create the test user without a first name
                testUser = {
                    email: 'test@test.test',
                    password: 'test',
                    profile: {lastName: 'Test', type: 'player', clubID: 'test'}
                };

                testPr = {
                    email: 'pr@pr.pr',
                    password: 'pr',
                    profile: {firstName: 'Pr', lastName: 'Pr', type: 'pr', clubID: 'test'}
                };

                testPr._id = Meteor.call('addUser', testPr);
                Meteor.userId = sinon.stub().returns(testPr._id);

                // Adding the item without an required attribute
                try {
                    Meteor.call('addUser', testUser);
                    // It should throw an error, if it does not, the test fails.
                    assert.fail();
                } catch (err) {
                    done();
                }

            });

            /**
             * @summary Adding a user with complete data succeeds
             * It adds the needed firstName to the testUser.
             * Then it tries to add this user to the users collection.
             * This should succeed.
             */
            it("Adding user with complete data succeeds", (done) => {
                // Add the missing firstName to the testUser
                testUser.profile.firstName = 'Test';

                // Add the testUser to the collection
                try {
                    testUser._id = Meteor.call('addUser', testUser);
                    done();
                    // Should succeed
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('updateUserProfile()', () => {
            /**
             * @summary Updating a user with incomplete data throws error
             * It makes a testProfile with a incorrect lastName.
             * Then it tries to update the profile of the previous created user.
             * This should throw an error.
             */
            it("Update User Profile with incomplete data throws error", () => {
                // Create a testProfile with a number for lastName
                testProfile = {firstName: 'Test', lastName: 14, type: 'player', clubID: 'test'};
                // Update the profile of the previous created user with the new testProfile
                try {
                    Meteor.call('updateUserProfile', testUser._id, testProfile);
                    // It should throw an error, if it does not, the test fails
                    assert.fail();
                } catch (err) {
                }
            });

            /**
             * @summary Updating a user with complete data succeeds
             * It updates the testProfile with the correct data.
             * Then it tries to update the profile of the previous created user.
             * This should succeed.
             */
            it("Update User Profile with complete data succeeds", (done) => {
                // Update the testProfile with the correct data
                testProfile.lastName = 'newTest';
                // Set the testUser profile to be the same as the testProfile
                // This is for later testing purposes
                testUser.profile = testProfile;
                // Update the profile of the previous created user with the new testProfile
                try {
                    var printing = Meteor.call('updateUserProfile', testUser._id, testProfile);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('getUserInfo()', () => {
            /**
             * @summary Getting user info with wrong parameters
             * It tries to get a user with a wrong parameter
             * This should throw error.
             */
            it("Get user info with non string id throws error", () => {

                // Get user with wrong parameter
                try {
                    Meteor.call('getUserInfo', 1234);
                    // It should throw an error, if it does not, the test fails
                    assert.fail();
                } catch (err) {
                }
            });

            /**
             * @summary Getting user info with non existing id
             * It tries to get a user that does not exist
             * This should throw error.
             */
            it("Get user info with non existing string id throws error", () => {

                // Get user with id that does not exist
                try {
                    Meteor.call('getUserInfo', 'test');
                    // It should throw an error, if it does not, the test fails
                    assert.fail();
                } catch (err) {
                }
            });


            /**
             * @summary Getting user info with existing id.
             * It tries to get the user we previously created in the database
             * Then a couple of asserts to check whether this user is indeed the same
             * This should succeed.
             */
            it("Get user info with existing string id succeeds", (done) => {

                // Get user with correct id
                try {
                    var gettingUser = Meteor.call('getUserInfo', testUser._id);
                    // Checks to see whether the user is the same or not.
                    assert.equal(gettingUser.emails[0].address, testUser.email);
                    assert.equal(gettingUser.profile.firstName, testUser.profile.firstName);
                    assert.equal(gettingUser.profile.lastName, testUser.profile.lastName);
                    assert.equal(gettingUser.profile.type, testUser.profile.type);
                    assert.equal(gettingUser.profile.clubID, testUser.profile.clubID);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('Meteor.users.remove()', () => {
            /**
             * @summary Deleting a user with existing id.
             * It tries to remove the previously created user.
             * This should succeed.
             */
            it("Deletes user with existing id", (done) => {
                // Remove the user from the collection
                try {
                    Meteor.users.remove(testUser._id);
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            /**
             * @summary Getting user info from previously deleted user.
             * It tries to get the previously created user that is now deleted.
             * This should throw error.
             */
            it("Should not be possible to get user info anymore", () => {
                // Get user with correct id, but is deleted
                try {
                    Meteor.call('getUserInfo', testUser._id);
                    // It should throw an error, if it does not, the test fails
                    assert.fail();
                } catch (err) {}

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
                    // Should succeed
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

    });
}