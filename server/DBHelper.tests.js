import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './DBHelper.js'
import '/model/Feed.js'

addedItem = {};
describe('FeedItems', () => {
    
    it("Add FeedItem", (done) => {
        addedItem = {
            creatorID: 0,
            type: "testItem",
            sticky: false,
            clubID: "0",
            status: "unpublished",
            createdAt: new Date,
            modifiedAt: new Date
        }
        
        Meteor.call('DBHelper.addFeedItem', addedItem, function (err, result) {
            if (err) {
                assert.fail();
            }
            done();
        });
    });
    
    it("Get FeedItem", (done) => {
        Meteor.call('DBHelper.getFeedItemByCreatedAt', addedItem.createdAt, function (err, result) {
            if (err) {
                assert.fail();
            }
            addedItem = result[0];
            assert(result[0].type == addedItem.type);
            done();
        });
    });
    
    it("Delete FeedItem", (done) => {
        Meteor.call('DBHelper.deleteFeedItem', addedItem._id, function (err, result) {
            if (err) {
                assert.fail();
            }
            Meteor.call('DBHelper.getFeedItemByCreatedAt', addedItem.createdAt, function (err, result) {
                if (err) {
                    assert.fail();
                }
                assert(result.length == 0);
                done();
            });
        });
    });
});