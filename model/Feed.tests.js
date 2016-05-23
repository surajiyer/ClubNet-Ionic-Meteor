import {assert} from 'meteor/practicalmeteor:chai';
import {Meteor} from 'meteor/meteor';
import './Feed.js'
import '/model/Feed.js'

if (Meteor.isServer) {
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
            };
            try {
                result = Meteor.call('addFeedItem', addedItem);
                done();
            } catch (err) {
                console.log(err);
                assert.fail(err);
            }
        });

        it("Get FeedItem", (done) => {
            try {
                result = Meteor.call('getFeedItemByCreatedAt', addedItem.createdAt);

                addedItem = result[0];
                assert(result[0].type == addedItem.type);
                done();
            } catch (err) {
                console.log(err);
                assert.fail();
            }
        });

        it("Delete FeedItem", (done) => {
            try {
                result = Meteor.call('deleteFeedItem', addedItem._id);
                assert(result.length == 0);
                done();
            } catch (err) {
                console.log(err);
                assert.fail();
            }
        });
    });
}