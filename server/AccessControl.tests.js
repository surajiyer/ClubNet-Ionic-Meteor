import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import {isAdmin} from '/imports/common';

import {accessControlSchema} from '/imports/schemas/misc';
import './AccessControl.js';

let testControl;
let userId = '1';
let testPr;
if (Meteor.isServer) {
    describe('Access Control', () => {
        
        it("Add Permissions", (done) => {
            // Add schema to Items
            AMx.attachSchema(accessControlSchema);

            testPr = {
                email: 'pr@pr.pr',
                password: 'pr',
                profile: {firstName: 'Pr', lastName: 'Pr', type: 'pr', clubID: 'test'}
            };
            testPr._id = Accounts.createUser(testPr);

            Meteor.userId = sinon.stub().returns(testPr._id);

            Meteor.user = sinon.stub().returns(testPr);
            
            // Create item without type
            testControl = {
                _id: 'pr',
                items: [{_id: 'testType', permissions: {create: true, 
                    edit: true, view: true, delete: true}}]
            };

            // Create item without type
            testType = {
                _id: 'testType',
                name: 'testType',
                icon: 'testType.ClubNet'
            };

            // Adding the custom type
            try {
                AMx.remove(testControl);
                TypesCollection.remove({});
                TypesCollection.insert(testType);
                Meteor.call('setPermissions', testControl);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Get permissions", (done) => {
            // Remove the user from the collection
            try {
                var permission = Meteor.call('checkRights', 'testType', 'create');
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
                // Should succeed
                done();
            } catch (err) {
                assert.fail();
            }
        });
        
    });
}