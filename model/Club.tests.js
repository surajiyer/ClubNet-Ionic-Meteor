import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';

// import {Meteor} from 'meteor/meteor';

import './Club.js';

testClub = {};
if (Meteor.isServer) {
    describe('Club', () => {

        it("Get Club", (done) => {
            
            // Create a test club
            testClub = {
                name: 'Name1',
                logo: 'logo',
                colorPrimary: '#FFFFFF',
                colorSecondary: '#FFFFFF',
                colorAccent: '#FFFFFF',
                heroesMax: 0
            };
            testClubID = Clubs.insert(testClub);
            testClub._id = testClubID;
            
            // Mock user to include the clubID of the test club we just added
            global.Meteor.user = sinon.stub().returns({
                profile : { clubID : testClub._id}
            });
            
            // Retrieving the club
            try {
                result = Meteor.call('getClub');
                assert(result._id == testClub._id);
                done();
            } catch (err) {
                assert.fail();
            }
        });
        
        it("Update Club", (done) => {
            
            // Changing the test club
            testClub.name = 'Name2'
            
            // Updating the club
            try {
                Meteor.call('updateClub', testClub);
                result = Meteor.call('getClub');
                assert(result.name == 'Name2');
                done();
            } catch (err) {
                assert.fail();
            }
        });
        
        it("Update Club Invalid Parameter", (done) => {
            
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