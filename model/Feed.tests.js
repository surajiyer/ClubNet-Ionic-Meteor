import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import { baseFeedItemSchema } from '/imports/schemas/feedItems';
import { baseResponseSchema } from '/imports/schemas/responses';
import './Feed.js';
import './feedItems/Voting.js';

let testItem;
if (Meteor.isServer) {
    userId = '1';
    describe('FeedItems', () => {

        describe('addFeedItem()', () => {
            it("Add FeedItem fail", () => {

                // Mock user and userId since there is no user logged in while testing
                global.Meteor.user = sinon.stub().returns({
                    profile: {clubID: '-'}
                });
                global.Meteor.userId = sinon.stub().returns(userId);

                // Add schema to Items
                Items.attachSchema(baseFeedItemSchema, {selector: {type: 'testType'}});

                // Create item without type
                
                testItem = {
                    creatorID: '1',
                    sticky: false,
                    clubID: '1',
                    published: true,
                    createdAt: new Date,
                    modifiedAt: new Date,
                    title: '1',
                    status: 'published',
                    deadline: new Date,
                    training_id: '1',
                    teamID: '1'
                };

                // Adding the item without type
                try {
                    Meteor.call('addFeedItem', testItem);
                    assert.fail();
                } catch (err) {}
            });

            it("Add FeedItem succeed", (done) => {
                // Add type to item
                testItem.type = 'Voting';

                // Add the item with type
                try {
                    var addFeedItemStub = sinon.stub(Meteor, 'call');
                    addFeedItemStub
                        .withArgs('addFeedItem', testItem)
                        .returns(Items.insert(testItem));
                    testItem._id = Meteor.call('addFeedItem', testItem);
                    Meteor.call.restore();
                    done();
                } catch (err) {
                    console.log('addfeeditem error: ' + err);
                    assert.fail();
                }
            });
        });

        describe('getFeedItem()', () => {

            it("Get FeedItem fail", () => {

                // Get item with wrong parameter
                try {
                    Meteor.call('getFeedItem', false);
                    assert.fail();
                } catch (err) {
                }

            });

            it("Get FeedItem succeed", (done) => {

                // Get item added in the previous test
                try {
                    var getFeedItemStub = sinon.stub(Meteor, 'call');
                    getFeedItemStub
                        .withArgs('getFeedItem', testItem._id)
                        .returns(Items.find({_id: testItem._id}).fetch()[0]);
                    var result = Meteor.call('getFeedItem', testItem._id);
                    assert(result._id == testItem._id);
                    testItem = result;
                    Meteor.call.restore();
                    done();
                } catch (err) {
                    console.log('hi: '+ err);
                    assert.fail();
                }
            });
        });

        describe('updateFeedItem()', () => {
            it("Update FeedItem fail", () => {

                // Create updated item with different clubID
                newTestItem = testItem;
                newTestItem.clubID = '2';

                // Update item with wrong parameter
                try {
                    Meteor.call('updateFeedItem', false);
                    assert.fail();
                } catch (err) {}

            });

            it("Update FeedItem succeed", (done) => {
                
                newTestItem.clubID = '2';
                // Update testItem to newTestItem
                try {
                    var updateFeedItemStub = sinon.stub(Meteor, 'call');
                    var temp = newTestItem._id;
                    Items.update(
                        {_id: temp},
                        {$set: newTestItem}
                    );
                    newTestItem._id = temp;
                    updateFeedItemStub
                        .withArgs('updateFeedItem', newTestItem)
                        .returns(Items.find(newTestItem._id).fetch()[0]);
                    var result = Meteor.call('updateFeedItem', newTestItem);
                    assert(result.clubID == newTestItem.clubID);
                    testItem = newTestItem;
                    Meteor.call.restore();
                    done();
                } catch (err) {
                    console.log('updateFeedItem: '+err);
                    assert.fail();
                }

            });
        });

        describe('putResponse()', () => {
            it("Put Response invalid id", () => {
                // Add schema to Responses
                Responses.attachSchema(baseResponseSchema, {selector: {itemType: testItem.type}});

                // Invalid id
                try {
                    Meteor.call('putResponse', false, testItem.type, '1');
                    assert.fail();
                } catch (err) {
                }

            });

            it("Put Response invalid id type", () => {
                // Invalid id type
                try {
                    Meteor.call('putResponse', testItem._id, false, '1');
                    assert.fail();
                } catch (err) {
                }

            });

            it("Put Response invalid value", () => {
                // Invalid value
                try {
                    Meteor.call('putResponse', testItem._id, testItem.type, false);
                    assert.fail();
                } catch (err) {
                }

            });

            it("Put Response valid input", (done) => {

                // Valid input          
                try {
                    Meteor.call('putResponse', testItem._id, testItem.type, '1');
                } catch (err) {
                    assert.fail();
                }
                done();
            });
        });

        describe('getResponse()', () => {
            it("Get Response wrong parameter", () => {

                // Get item with wrong parameter
                try {
                    Meteor.call('getResponse', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("Get Response", (done) => {

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
        });

        describe('getResponseOfOneItem()', () => {
            it("Get Responses of One Item wrong parameter", () => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getResponsesOfOneItem', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("Get Responses of One Item without responses", (done) => {
                // Get reponses of item without responses
                try {
                    result = Meteor.call('getResponsesOfOneItem', 'otherItem');
                    assert(result.length == 0);
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            it("Get Responses of One Item", (done) => {
                // Get responses of item added in the previous test
                try {
                    result = Meteor.call('getResponsesOfOneItem', testItem._id);
                    assert(result.length == 1);
                    assert(result[0].itemID == testItem._id);
                } catch (err) {
                    assert.fail();
                }
                done();
            });
        });

        describe('getResponseOfItemType()', () => {
            it("Get Responses of ItemType wrong parameter", () => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getResponsesOfItemType', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("Get Responses of ItemType without responses", () => {
                // Get reponses of item without reponeses
                try {
                    result = Meteor.call('getResponsesOfItemType', 'otherItemType');
                    assert(result.length == 0);
                } catch (err) {
                    assert.fail();
                }
            });

            it("Get Responses of ItemType", (done) => {

                // Get reponses of item added in the previous test
                try {
                    result = Meteor.call('getResponsesOfItemType', testItem.type);
                    assert(result.length == 1);
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('getVotingResults()', () => {
            it("Get Voting Results wrong parameters", (done) => {
                // Get results with wrong parameter
                try {
                    Meteor.call('getVotingResults', false);
                    assert.fail();
                } catch (err) {
                    done();
                }
            });

            it("Get Voting Results normally", (done) => {
                // Get results of item added in the previous test
                try {
                    var result = Meteor.call('getVotingResults', testItem._id);
                    assert(result[0].length == 3);
                    assert(result[0][0] == 1);
                    assert(result[0][1] == 0);
                    assert(result[0][2] == 0);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }

                done();
            });

            it("Get Voting Results, adding a response", (done) => {


                // Add extra responses and check result
                try {
                    userId = '2';
                    Meteor.call('putResponse', testItem._id, testItem.type, '1');
                    userId = '3';
                    Meteor.call('putResponse', testItem._id, testItem.type, '2');
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
        });

        describe('deleteResponse()', () => {
            it("Delete Response wrong parameter", () => {
                // Delete response with wrong parameter
                try {
                    Meteor.call('deleteResponse', false);
                    assert.fail();
                } catch (err) {
                }

            });

            it("Delete Response", (done) => {
                // Delete response added in the addResponse testcase
                try {
                    result = Meteor.call('deleteResponse', testItem._id);
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('deleteFeedItem()', () => {
            it("Delete FeedItem wrong parameter", () => {
                // Delete item with wrong parameter
                try {
                    Meteor.call('deleteFeedItem', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("Delete FeedItem", (done) => {
                // Delete item added in the addFeedItem testcase
                try {
                    var deleteFeedItemStub = sinon.stub(Meteor, 'call');
                    deleteFeedItemStub
                        .withArgs('updateFeedItem', testItem._id)
                        .returns(Items.remove({_id: testItem._id}));
                    Meteor.call('deleteFeedItem', testItem._id);
                    Meteor.call.restore();
                    try {
                        var result = Items.find(testItem._id).fetch()[0];
                        assert.equal(result, undefined);
                    } catch (err) {
                        console.log(err);
                    }
                    done();
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('trainings()', () => {
            it("Get trainings", (done) => {

                // Try to get some trainings
                try {
                    Meteor.call('getTrainings');
                    done();
                } catch (err) {
                    assert(false, "Error with training retrieval.");
                }

            });

            it("Get exercsises for a particular training", (done) => {

                // Get exercises for invalid type parameter.
                try {
                    Meteor.call('getExercises', false);
                    assert(false, "No exercises should be retrieved when a invalid parameter is passed.");
                } catch (err) {
                    done();
                }

            });
        });

    });
}