import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import './Club.js';

let testClub = {};
if (Meteor.isServer) {
    describe('Club', () => {
        before(() => {
            // Create a test club
            testClub = {
                name: 'Name1',
                logo: 'logo',
                colorPrimary: '#FFFFFF',
                colorSecondary: '#FFFFFF',
                colorAccent: '#FFFFFF',
                heroesMax: 0
            };
            testClub._id = Clubs.insert(testClub);
        });

        beforeEach(() => {
            // Mock user to include the clubID of the test club we just added
            sinon.stub(global.Meteor, 'user').returns({
                profile : { clubID : testClub._id}
            });
        });

        afterEach(() => {
            sinon.restore(global.Meteor.user);
        });

        it("should throw error while getting non-existing club info", (done) => {
            // Mock user to include the clubID of the test club we just added
            global.Meteor.user.returns({
                profile : { clubID : 'test'}
            });

            // Retrieving the club
            try {
                result = Meteor.call('getClub');
                assert.fail();
            } catch (err) {
                done();
            }
        });

        it("should get club info", (done) => {
            // Retrieving the club
            try {
                result = Meteor.call('getClub');
                assert.equal(result._id, testClub._id);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("should update club name", (done) => {
            // Changing the test club
            testClub.name = 'Name2';

            // Updating the club
            try {
                Meteor.call('updateClub', testClub);
                result = Meteor.call('getClub');
                assert.equal(result.name, 'Name2');
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("should throw error when updating club with invalid parameters", (done) => {
            // Retrieving the club
            try {
                Meteor.call('updateClub', false);
                assert.fail();
            } catch (err) {
                done();
            }
        });
    });
}