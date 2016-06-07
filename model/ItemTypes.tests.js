import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import { feedItemTypesSchema } from '/imports/schemas/feedItems';
import './ItemTypes.js';

if (Meteor.isServer) {
    describe('ItemTypes', () => {
        it("Add ItemType", (done) => {
            // Add schema to Items
            TypesCollection.attachSchema(feedItemTypesSchema);

            // Create item without type
            testType = {
                _id: '1',
                name: 'testType',
                icon: 'testType.ClubNet'
            };

            // Adding the custom type
            try {
                TypesCollection.remove({});
                TypesCollection.insert(testType);
                done();
            } catch (err) {
                assert.fail();
            }
        });

        it("Get FeedType", (done) => {
            // Get item added in the previous test
            try {
                var result = Meteor.call('getItemTypes');
                assert(result[0]._id == testType._id);
                done();
            } catch (err) {
                assert.fail();
            }
        });
    });
}