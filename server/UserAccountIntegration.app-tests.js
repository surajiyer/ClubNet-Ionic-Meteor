import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './AccessControl';
import './ItemTypes';
import './UserAccount';


let testPr;
let testUser;
let testProfile;

if (Meteor.isServer) {
    describe('User Accounts Integration Test', () => {
        // In the before, the database is reset
        // And the needed accounts and environment details are set up
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
                    notifications: {}
                }
            };
            // Create it in the database
            testPr._id = Accounts.createUser(testPr);

            // Create a fake player user
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

            // Create a fake profile
            testProfile = {
                firstName: 'Test',
                lastName: 'Test',
                type: 'player',
                clubID: 'test',
                teamID: 'test2',
                notifications: {}
            };
            
        });

        // In the after, the database is again reset
        after(() => {
            // Reset the database
            Meteor.users.remove({});
            AMx.remove({});
            TypesCollection.remove({});
        });

        describe('PR user wants to create a user', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
            });
            
            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });


            /**
             * @summary Adding a user with complete data succeeds
             * It uses the testUser created in the before
             * Then it tries to add this user to the users collection.
             * This should succeed.
             */
            it("should create user succesfully ", (done) => {
                try {
                    testUser._id = Meteor.call('addUser', testUser);
                    done();
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
            
            /**
             * @summary Getting user info with existing id.
             * It tries to get info of the previously user created in the database
             * Then a check whether the player was indeed inserted correclty
             * This should succeed.
             */
            it("should retrieve the created user correctly ", () => {
                try {
                    var response = Meteor.call('getUserInfo', testUser._id);
                    assert.equal(response.profile.teamID, 'test')
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
            
        });

        describe('PR user wants to update the just created user', () => {
            before(() => {
                // Stub Meteor.user and Meteor.userId as PR user
                Meteor.userId = sinon.stub().returns(testPr._id);
                Meteor.user = sinon.stub().returns(testPr);
            });

            after(() => {
                // Restore the stubs from the before
                sinon.restore(Meteor.user);
                sinon.restore(Meteor.userId);
            });

            /**
             * @summary Updating a user with complete data succeeds
             * It uses the testProfile created in the before.
             * Then it tries to update the profile of the previous created user with this testProfile.
             * This should succeed.
             */
            it("should update the user succesfully ", (done) => {
                try {
                    var response = Meteor.call('updateUserProfile', testUser._id, testProfile);
                    done();
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            /**
             * @summary Getting user info with existing id.
             * It tries to get info of the previously user created in the database
             * Then a check whether the player was indeed updated or not.
             * This should succeed.
             */

            it("should retrieve the updated data succesfully ", () => {
                try {
                    var response = Meteor.call('getUserInfo', testUser._id);
                    assert.equal(response.profile.teamID, 'test2')
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });
    });
}