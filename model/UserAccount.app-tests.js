import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import {StubCollections} from 'meteor/hwillson:stub-collections';

import {isAdmin} from '/imports/common';
import {userSchema, userProfileSchema} from '/imports/schemas/users';
import {notesSchema} from '/imports/schemas/misc';
import './UserAccount.js';

if (Meteor.isServer) {
    let testUser;
    userId = '1';
    describe('UserAccount', () => {

        it("Add User", (done) => {
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
                email: 'test@test.test10',
                password: 'test',
                profile: {lastName: 'Test', type: 'player', clubID: 'test'}
            };
            
            // Adding the item without an required attribute
            try {
                Meteor.call('addUser', testUser);
                assert.fail();
            } catch (err) {
            }

            // Add type to item
            testUser.profile.firstName = 'Test';

            // Add the item with type
            try {
                testUser._id = Meteor.call('addUser', testUser);
                //console.log(Accounts.users.find({_id: testUser._id}).fetch());
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Update User Profile", (done) => {

            testProfile = {firstName: 'Test', lastName: 14, type: 'player', clubID: 'test'};
            // Get item with wrong parameter
            try {
                Meteor.call('updateUserProfile', testProfile);
                assert.fail();
            } catch (err) {}

            testProfile.lastName = 'newTest';
            // Get item added in the previous test
            try {
                Meteor.call('updateUserProfile', testProfile);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Get user info", (done) => {

            // Get item with wrong parameter
            try {
                Meteor.call('getUserInfo', 1234);
                assert.fail();
            } catch (err) {
            }

            // Get item added in the previous test
            try {
                console.log(testUser._id);
                Meteor.call('getUserInfo', testUser._id);
                done();
            } catch (err) {
                console.log(err);
                assert.fail();
            }
        });
    });
}