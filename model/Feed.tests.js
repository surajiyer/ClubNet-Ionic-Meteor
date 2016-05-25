import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import { baseFeedItemSchema } from '/imports/schemas/feedItems';
import { baseResponseSchema } from '/imports/schemas/responses';
import './Feed.js'

if (Meteor.isServer) {
    userId = '1'
    describe('FeedItems', () => {

        it("Add FeedItem", (done) => {
            
            // Mock user and userId since there is no user logged in while testing
            global.Meteor = {
                user: sinon.stub().returns({
                    profile : { clubID : '-'}
                }),
                userId: sinon.stub().returns(userId)
            };
            
            // Add schema to Items
            Items.attachSchema(baseFeedItemSchema, {selector: {type: 'testType'}});
            
            // Create item without type
            testItem = {
                clubID: '1',
                published: false,
                createdAt: new Date
            };
            
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
                Meteor.call('getFeedItemType', false);
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
            
            // Update item with wrong parameter
            try {
                Meteor.call('updateFeedItem', false);
                assert.fail();
            } catch (err) {}
            
            // Update testItem to newTestItem
            try {
                Meteor.call('updateFeedItem', newTestItem);
                result = Meteor.call('getFeedItem', testItem._id);
                assert(result.clubID == newTestItem.clubID);
                testItem = newTestItem;
                done();
            } catch (err) {
                assert.fail();
            }
            
        });

        it("Put Response", (done) => {
            
            // Add schema to Responses
            Responses.attachSchema(baseResponseSchema, {selector: {itemType: testItem.type}});
            
            // Invalid id            
            try {
                Meteor.call('putResponse', false, testItem.type, '0');
                assert.fail();
            } catch (err) {}
            
            // Invalid id type          
            try {
                Meteor.call('putResponse', testItem._id, false, '0');
                assert.fail();
            } catch (err) {}
            
            // Invalid value            
            try {
                Meteor.call('putResponse', testItem._id, testItem.type, false);
                assert.fail();
            } catch (err) {}
            
            // Valid input          
            try {
                Meteor.call('putResponse', testItem._id, testItem.type, '0');
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
            } catch (err) {
                assert.fail();
            }
                
            done();
        });  
        
        it("Get Responses of One Item", (done) => {
            
            // Get responses with wrong parameter
            try {
                Meteor.call('getResponsesOfOneItem', false);
                assert.fail();
            } catch (err) {}
            
            // Get reponses of item without reponeses
            try {
                result = Meteor.call('getResponsesOfOneItem', 'otherItem');
                assert(result.length == 0);
            } catch (err) {
                assert.fail();
            }
            
            // Get reponses of item added in the previous test
            try {
                result = Meteor.call('getResponsesOfOneItem', testItem._id);
                assert(result.length == 1);
                assert(result[0].itemID == testItem._id);
            } catch (err) {
                assert.fail();
            }
            
            done();
        });
        
        it("Get Responses of ItemType", (done) => {
            
            // Get responses with wrong parameter
            try {
                Meteor.call('getResponsesOfItemType', false);
                assert.fail();
            } catch (err) {}
            
            // Get reponses of item without reponeses
            try {
                result = Meteor.call('getResponsesOfItemType', 'otherItemType');
                assert(result.length == 0);
            } catch (err) {
                assert.fail();
            }
            
            // Get reponses of item added in the previous test
            try {
                result = Meteor.call('getResponsesOfItemType', testItem.type);
                assert(result.length == 1);
            } catch (err) {
                assert.fail();
            }
            
            done();
        });
        
        it("Get Voting Results", (done) => {
            
            // Get results with wrong parameter
            try {
                Meteor.call('getVotingResults', false);
                console.log('false value');
            } catch (err) {}
            
            // Get results of item added in the previous test
            try {
                result = Meteor.call('getVotingResults', testItem._id);
                assert(result[0].length == 3);
                assert(result[0][0] == 1);
                assert(result[0][1] == 0);
                assert(result[0][2] == 0);
            } catch (err) {
                assert.fail();
            }
            
            // Add extra responses and check result
            try { 
                userId = '2';
                Meteor.call('putResponse', testItem._id, testItem.type, '0');
                userId = '3';
                Meteor.call('putResponse', testItem._id, testItem.type, '1');
                result = Meteor.call('getVotingResults', testItem._id);
                assert(result[0].length == 3);
                assert(result[0][0] == 2);
                assert(result[0][1] == 1);
                assert(result[0][2] == 0);
                
                Meteor.call('deleteResponse', testItem._id);
                userId = '2';
                Meteor.call('deleteResponse', testItem._id);
                userId = '1';
            } catch (err) {
                assert.fail();
            }
            
            done();
        });  
        
        it("Delete Response", (done) => {
            
            // Delete response with wrong parameter
            try {
                Meteor.call('deleteResponse', false);
                assert.fail();
            } catch (err) {}
            
            // Delete response added in the addResponse testcase
            try {
                result = Meteor.call('deleteResponse', testItem._id);
                done();
            } catch (err) {
                assert.fail();
            }
        });
        
        it("Delete FeedItem", (done) => {
            
            // Delete item with wrong parameter
            try {
                Meteor.call('deleteFeedItem', false);
                assert.fail();
            } catch (err) {}
            
            // Delete item added in the addFeedItem testcase
            try {
                result = Meteor.call('deleteFeedItem', testItem._id);
                done();
            } catch (err) {
                assert.fail();
            }
        });
    });
}