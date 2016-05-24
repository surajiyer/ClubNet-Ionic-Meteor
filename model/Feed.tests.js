import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import { baseFeedItemSchema } from '/imports/schemas/feedItems';
import { baseResponseSchema } from '/imports/schemas/responses';
import './Feed.js'

if (Meteor.isServer) {
    
    describe('FeedItems', () => {
        
        it("Add FeedItem", (done) => {
            
            // Mock user and userId since there is no user logged in while testing
            global.Meteor = {
                user: sinon.stub().returns({
                    profile : { clubID : '-'}
                }),
                userId: sinon.stub().returns('-')
            };
            
            // Add schema to Items
            Items.attachSchema(baseFeedItemSchema, {selector: {type: 'testType'}});
            
            // Create item without type
            testItem = {
                clubID: '1',
                published: false,
                createdAt: new Date
            }
            
            // Adding the item without type
            try {
                Meteor.call('addFeedItem', testItem);
                assert.fail();
            } catch (err) {}
            
            // Add type to item
            testItem.type = 'testType';
            
            // Add the item with type
            try {
                testItem._id = Meteor.call('addFeedItem', testItem);
                done();
            } catch (err) {
                assert.fail();
            }
        });
        
        it("Get FeedItem", (done) => {
            
            // Get item with wrong parameter
            try {
                Meteor.call('getFeedItem', false);
                assert.fail();
            } catch (err) {}
            
            // Get item added in the previous test
            try {
                result = Meteor.call('getFeedItem', testItem._id);
                assert(result._id == testItem._id);
                testItem = result
                done();
            } catch (err) {
                assert.fail();
            }
        });
        
        it("Get FeedItem Type", (done) => {
            // Get item type with wrong parameter
            try {
                Meteor.call('getFeedItem', false);
                assert.fail();
            } catch (err) {}
            
            // Get item added in the previous test
            try {
                result = Meteor.call('getFeedItemType', testItem._id);
                assert(result == testItem.type);
                done();
            } catch (err) {
                assert.fail();
            }
        })
        
        it("Update FeedItem", (done) => {
            
            // Create updated item with different clubID
            newTestItem = {
                _id: testItem._id,
                published: testItem.published,
                createdAt: testItem.createdAt,
                type: testItem.type,
                clubID: '2',
                creatorID: testItem.creatorID
            };
            assert(newTestItem.clubID != testItem.clubID);
            
            // Update testItem to newTestItem
            try {
                Meteor.call('updateFeedItem', newTestItem);
                result = Meteor.call('getFeedItem', testItem._id);
                assert(result.clubID == newTestItem.clubID);
                testItem = newTestItem;
                done();
            } catch (err) {
                console.log(err);
                assert.fail();
            }
            
        });
        
        it("Put Response", (done) => {
            
            // Add schema to Responses
            Responses.attachSchema(baseResponseSchema, {selector: {itemType: testItem.type}});
            
            // Invalid id            
            try {
                Meteor.call('putResponse', false, testItem.type, 0);
                assert.fail();
            } catch (err) {}
            
            // Invalid id type          
            try {
                Meteor.call('putResponse', testItem._id, false, 0);
                assert.fail();
            } catch (err) {}
            
            // Invalid value            
            try {
                Meteor.call('putResponse', testItem._id, testItem.type, false);
                assert.fail();
            } catch (err) {}
            
            // Valid input          
            try {
                Meteor.call('putResponse', testItem._id, testItem.type, 0);
            } catch (err) {
                assert.fail();
            }
            
            done();
        });    
        
        it("Get Response", (done) => {
            
            // Get item with wrong parameter
            try {
                Meteor.call('getResponse', false);
                assert.fail();
            } catch (err) {}
            
            // Get reponse added in the previous test
            try {
                result = Meteor.call('getResponse', testItem._id);
                assert(result.itemID == testItem._id);
                testResponse = result
                done();
            } catch (err) {
                console.log(err);
                assert.fail();
            }
        });  
        
        it("Delete FeedItem", (done) => {
            
            // Delete item added in the addFeedItem testcase
            try {
                result = Meteor.call('deleteFeedItem', testItem._id);
                done();
            } catch (err) {
                console.log(err);
                assert.fail();
            }
        });
    });
}