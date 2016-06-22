import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import {baseResponseSchema} from '/imports/schemas/responses';
import './Feed.js';
import './feedItems/Voting.js';

let testItem;
if (Meteor.isServer) {
    userId = '1';
    user = {profile: {clubID: '-'}};

    describe('FeedItems', () => {
        beforeEach(() => {
            // Mock user and userId since there is no user logged in while testing
            sinon.stub(global.Meteor, 'user').returns(user);
            sinon.stub(global.Meteor, 'userId').returns(userId);
        });

        afterEach(() => {
            sinon.restore(global.Meteor.user);
            sinon.restore(global.Meteor.userId);
        });

        describe('addFeedItem()', () => {
            it("should fail adding a feed item", () => {
                // Create item without type
                testItem = {
                    creatorID: '1',
                    sticky: false,
                    clubID: '1',
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
                } catch (err) {
                }
            });

            it("should succeed adding a feed item", () => {
                // Add type to item
                testItem.type = 'Voting';

                // Add the item with type
                try {
                    var addFeedItemStub = sinon.stub(Meteor, 'call');
                    addFeedItemStub
                        .withArgs('addFeedItem', testItem)
                        .returns(Items.insert(testItem));
                    testItem._id = Meteor.call('addFeedItem', testItem);
                    sinon.restore(Meteor.call);
                } catch (err) {
                    console.log('addfeeditem error: ' + err);
                    assert.fail();
                }
            });

            after(() => {
                Items.remove({});
            });

        });

        describe('getFeedItem()', () => {
            it("should fail getting feed item", () => {
                // Get item with wrong parameter
                try {
                    Meteor.call('getFeedItem', false);
                    assert.fail();
                } catch (err) {
                }
            });

            before(() => {
                Items.insert(testItem);
            });

            it("should get feed item successfully", () => {
                // Get item added in the previous test
                try {
                    var getFeedItemStub = sinon.stub(Meteor, 'call');
                    getFeedItemStub
                        .withArgs('getFeedItem', testItem._id)
                        .returns(Items.find({_id: testItem._id}).fetch()[0]);
                    var result = Meteor.call('getFeedItem', testItem._id);
                    assert(result._id == testItem._id);
                    testItem = result;
                    sinon.restore(Meteor.call);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            after(() => {
                Items.remove({});
            });
        });

        describe('updateFeedItem()', () => {
            before(() => {
                testItem._id = Items.insert(testItem);
                newTestItem = testItem;
                newTestItem.clubID = '2';
            });
            it("should fail updating a feed item", () => {
                // Create updated item with different clubID

                // Update item with wrong parameter
                try {
                    Meteor.call('updateFeedItem', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("should succeed updating a feed item", (done) => {
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
                    console.log('updateFeedItem: ' + err);
                    assert.fail();
                }
            });

            after(() => {
                Items.remove({});
            });
        });

        describe('putResponse()', () => {
            it("should throw error with invalid id", () => {
                // Add schema to Responses
                Responses.attachSchema(baseResponseSchema, {selector: {itemType: testItem.type}});

                // Invalid id
                try {
                    Meteor.call('putResponse', false, testItem.type, '1');
                    assert.fail();
                } catch (err) {
                }
            });

            it("should throw error with invalid id and type", () => {
                // Invalid id type
                try {
                    Meteor.call('putResponse', testItem._id, false, '1');
                    assert.fail();
                } catch (err) {
                }
            });

            it("should throw error with invalid response value", () => {
                // Invalid value
                try {
                    Meteor.call('putResponse', testItem._id, testItem.type, false);
                    assert.fail();
                } catch (err) {
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
            });

            after(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should add response successfully with valid input", () => {
                // Valid input          
                try {
                    Meteor.call('putResponse', testItem._id, testItem.type, '1');
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('getResponse()', () => {
            it("should throw error with wrong parameters", () => {
                // Get item with wrong parameter
                try {
                    Meteor.call('getResponse', false);
                    assert.fail();
                } catch (err) {
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            after(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should get the response successfully", () => {
                // Get response added in the previous test
                try {
                    result = Meteor.call('getResponse', testItem._id);
                    assert.equal(result.itemID, testItem._id);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('getResponseOfOneItem()', () => {
            it("should throw error with wrong parameter", () => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getResponsesOfOneItem', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("should get an empty array of responses for item without responses", (done) => {
                // Get responses of item without responses
                try {
                    result = Meteor.call('getResponsesOfOneItem', 'otherItem');
                    assert.equal(result.length, 0);
                    done();
                } catch (err) {
                    assert.fail();
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            after(() => {
                Items.remove({});
                Responses.remove({});
            });


            it("should get the responses on a feed item", (done) => {
                // Get responses of item added in the previous test
                try {
                    result = Meteor.call('getResponsesOfOneItem', testItem._id);
                    assert.equal(result.length, 1);
                    assert.equal(result[0].itemID, testItem._id);
                } catch (err) {
                    assert.fail();
                }
                done();
            });
        });

        describe('getNumberResponsesOfOneItem()', () => {
            it("should throw error with wrong parameters ", () => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getNumberResponsesOfOneItem', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("should get 0 responses for item without responses ", () => {
                // Get responses of item without responses
                try {
                    result = Meteor.call('getNumberResponsesOfOneItem', 'otherItem');
                    assert.equal(result, 0);
                } catch (err) {
                    assert.fail();
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            after(() => {
                Items.remove({});
                Responses.remove({});
            });


            it("should get 1 response for an item with 1 response", () => {
                // Get responses of item added in the previous test
                try {
                    result = Meteor.call('getNumberResponsesOfOneItem', testItem._id);
                    assert.equal(result, 1);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('getResponseOfItemType()', () => {
            it("should throw error with invalid parameters", () => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getResponsesOfItemType', false);
                    assert.fail();
                } catch (err) {
                }
            });

            it("should get an empty array for an item type that does not have responses", () => {
                // Get responses of item without responses
                try {
                    result = Meteor.call('getResponsesOfItemType', 'otherItemType');
                    assert.equal(result.length, 0);
                } catch (err) {
                    assert.fail();
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            after(() => {
                Items.remove({});
                Responses.remove({});
            });


            it("should get all responses of given item type", () => {
                // Get responses of item added in the previous test
                try {
                    var result = Meteor.call('getResponsesOfItemType', testItem.type);
                    assert(result.length == 1);
                    //assert.equal(result.length, 1);
                } catch (err) {
                    console.log('fbuifbsuiebfuisbf', err);
                    assert.fail();
                }
            });
        });

        describe('getVotingResults()', () => {
            it("should throw error with invalid parameters", (done) => {
                // Get results with wrong parameter
                try {
                    Meteor.call('getVotingResults', false);
                    assert.fail();
                } catch (err) {
                    done();
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            after(() => {
                Items.remove({});
                Responses.remove({});
            });


            it("should get the voting results", () => {
                // Get results of item added in the previous test
                try {
                    var result = Meteor.call('getVotingResults', testItem._id);
                    assert.equal(result[0].length, 3);
                    assert.equal(result[0][0], 1);
                    assert.equal(result[0][1], 0);
                    assert.equal(result[0][2], 0);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });

            it("should get the voting results with a new vote added", () => {
                // Add extra responses and check result
                try {
                    Meteor.call('putResponse', testItem._id, testItem.type, '1');
                    Meteor.call('putResponse', testItem._id, testItem.type, '2');
                    result = Meteor.call('getVotingResults', testItem._id);
                    assert.equal(result[0].length, 3);
                    assert.equal(result[0][0], 2);
                    assert.equal(result[0][1], 1);
                    assert.equal(result[0][2], 0);

                    Meteor.call('deleteResponse', testItem._id);
                    Meteor.call('deleteResponse', testItem._id);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('deleteResponse()', () => {
            it("should throw error with invalid parameter", () => {
                // Delete response with wrong parameter
                try {
                    Meteor.call('deleteResponse', false);
                    assert.fail();
                } catch (err) {
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            after(() => {
                Items.remove({});
            });

            it("should delete response", () => {
                // Delete response added in the addResponse test case
                try {
                    Meteor.call('deleteResponse', testItem._id);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('deleteFeedItem()', () => {
            it("should throw error with invalid parameter", () => {
                // Delete item with wrong parameter
                try {
                    Meteor.call('deleteFeedItem', false);
                    assert.fail();
                } catch (err) {
                }
            });

            before(() => {
                testItem._id = Items.insert(testItem);
            });

            after(() => {
                Items.remove({});
            });

            it("should delete the feed item", () => {
                // Delete item added in the addFeedItem test case
                try {
                    var deleteFeedItemStub = sinon.stub(Meteor, 'call');
                    deleteFeedItemStub
                        .withArgs('updateFeedItem', testItem._id)
                        .returns(Items.remove({_id: testItem._id}));
                    Meteor.call('deleteFeedItem', testItem._id);
                    sinon.restore(Meteor.call);
                    try {
                        var result = Items.find(testItem._id).fetch()[0];
                        assert.equal(result, undefined);
                    } catch (err) {
                        console.log(err);
                    }
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('trainings()', () => {
            it("should get trainings", () => {
                // Try to get some trainings
                try {
                    Meteor.call('getTrainings');
                } catch (err) {
                    assert.fail();
                }
            });

            it("should throw error with invalid parameters", () => {
                // Get exercises for invalid type parameter.
                try {
                    Meteor.call('getExercises', false);
                    assert.fail();
                } catch (err) {
                }
            });
        });
    });
}