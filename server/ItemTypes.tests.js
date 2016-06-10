import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import {feedItemTypesSchema} from '/imports/schemas/feedItems';
import './ItemTypes';

describe('ItemTypes', () => {
    it("Add ItemTypes", (done) => {
        // Add schema to Items
        TypesCollection.attachSchema(feedItemTypesSchema);

        // Create item without type
        testType = {
            _id: '1',
            name: 'testType',
            icon: 'testType.ClubNet'
        };

        testType2 = {
            _id: '2',
            name: 'testType2',
            icon: 'testType2.ClubNet'
        };

        // Adding the custom type
        try {
            TypesCollection.remove({});
            TypesCollection.insert(testType);
            TypesCollection.insert(testType2);
            done();
        } catch (err) {
            assert.fail();
        }
    });

    it("Get ItemTypes", (done) => {
        // Get item added in the previous test
        try {
            var result = Meteor.call('getItemTypes');
            assert(result[0]._id == testType._id);
            assert(result[1]._id == testType2._id);
            done();
        } catch (err) {
            assert.fail();
        }
    });

    it("Get ItemType with wrong parameter", (done) => {
        // Get item added in the previous test
        try {
            var result = Meteor.call('getItemType', false);
            assert.fail();
        } catch (err) {
            done();
        }
    });

    it("Get ItemType with correct parameter", (done) => {
        // Get item added in the previous test
        try {
            var result = Meteor.call('getItemType', '1');
            assert(result._id == testType._id);
            done();
        } catch (err) {
            assert.fail();
        }
    });
});