import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import {isAdmin} from '/imports/common';
import {userSchema, userProfileSchema} from '/imports/schemas/users';
import {notesSchema} from '/imports/schemas/misc';
import './UserAccount.js';

//meteor test --full-app --driver-package practicalmeteor:mocha

if (Meteor.isServer) {
    let testUser;
    let testProfile;
    userId = '1';
    describe('UserAccount', () => {

        it("Adding user with incomplete data throws error", () => {
            // Mock user and userId since there is no user logged in while testing
            global.Meteor = {
                user: sinon.stub().returns({
                    profile : { clubID : '-', type: 'pr'}
                }),
                userId: sinon.stub().returns(userId)
            };
            Meteor.userId = sinon.stub().returns(userId);

            // Add schema to Items
            Meteor.users.attachSchema(userSchema);

            // Create item without type
            testUser = {
                email: 'test@test.test',
                password: 'test',
                profile: {lastName: 'Test', type: 'player', clubID: 'test'}
            };
            
            // Adding the item without an required attribute
            try {
                Meteor.call('addUser', testUser);
                assert.fail();
            } catch (err) {
            }

        });

        it("Adding user with complete data succeeds", (done) => {
            // Add type to item
            testUser.profile.firstName = 'Test';

            // Add the item with type
            try {
                testUser._id = Meteor.call('addUser', testUser);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Update User Profile with incomplete data throws error", () => {

            testProfile = {firstName: 'Test', lastName: 14, type: 'player', clubID: 'test'};
            // Get item with wrong parameter
            try {
                Meteor.call('updateUserProfile',testUser._id, testProfile);
                assert.fail();
            } catch (err) {
            }
        });

        it("Update User Profile with complete data succeeds", (done) => {

            testProfile.lastName = 'newTest';
            testUser.profile = testProfile;
            // Get item added in the previous test
            try {
                Meteor.call('updateUserProfile',testUser._id, testProfile);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Get user info with non string id throws error", () => {

            // Get item with wrong parameter
            try {
                Meteor.call('getUserInfo', 1234);
                assert.fail();
            } catch (err) {
            }
        });

        it("Get user info with non existing string id throws error", () => {

            // Get item with wrong parameter
            try {
                Meteor.call('getUserInfo', 'test');
                assert.fail();
            } catch (err) {
            }
        });

        it("Get user info with existing string id succeeds", (done) => {

            // Get item added in the previous test
            try {
                var gettingUser = Meteor.call('getUserInfo', testUser._id);
                assert.equal(gettingUser.emails[0].address, testUser.email);
                assert.equal(gettingUser.profile.firstName, testUser.profile.firstName);
                assert.equal(gettingUser.profile.lastName, testUser.profile.lastName);
                assert.equal(gettingUser.profile.type, testUser.profile.type);
                assert.equal(gettingUser.profile.clubID, testUser.profile.clubID);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Deletes user with existing id", (done) => {
            // Get item with wrong parameter
            try {
                Meteor.users.remove(testUser._id);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Should not be possible to get user info anymore", () => {

            try {
                Meteor.call('getUserInfo', testUser._id);
                assert.fail();
            } catch (err) {}

        });
    });
}