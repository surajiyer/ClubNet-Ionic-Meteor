import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';

import {baseResponseSchema} from '/imports/schemas/responses';
import './Feed';
import './feedItems/Voting';

let testItem;

if (Meteor.isServer) {
    userId = '1';
    user = {profile: {clubID: '-'}};
    // Create item without type
    testItem = {
        creatorID: userId,
        sticky: false,
        type: 'Voting',
        clubID: '1',
        createdAt: new Date,
        modifiedAt: new Date,
        title: '1',
        status: 'published',
        deadline: new Date,
        training_id: '1',
        teamID: '1'
    };

    describe('FeedItems', () => {
        beforeEach(() => {
            // Mock user and userId since there is no user logged in while testing
            sinon.stub(global.Meteor, 'user').returns(user);
            sinon.stub(global.Meteor, 'userId').returns(userId);

            // Monkey patch Meteor.call method to only certain calls
            Meteor.__call = Meteor.call;
            Meteor.call = function (name) {
                if (name == 'sendTeamNotification'
                    || name == 'sendClubNotification'
                    || name == 'checkRepeatInterval'
                    || name == 'checkRights') return true;
                return Meteor.__call.apply(this, arguments);
            };
        });

        afterEach(() => {
            sinon.restore(global.Meteor.user);
            sinon.restore(global.Meteor.userId);
            Meteor.call = Meteor.__call;
        });

        describe('addFeedItem()', () => {
            afterEach(() => {
                Items.remove({});
            });

            it("should fail adding a feed item without item type (invalid parameter)", (done) => {
                // Adding the item without type
                try {
                    var item = JSON.parse(JSON.stringify(testItem));
                    delete item.type;
                    Meteor.call('addFeedItem', item);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should succeed adding a feed item", () => {
                // Add the item with type
                try {
                    var itemId = Meteor.call('addFeedItem', testItem);
                    check(itemId, String);
                    testItem._id = itemId;
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('getFeedItem()', () => {
            beforeEach(() => {
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;
            });

            afterEach(() => {
                Items.remove({});
            });

            it("should fail getting feed item with non-String input", (done) => {
                // Get item with wrong parameter
                try {
                    Meteor.call('getFeedItem', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should get feed item successfully", () => {
                // Get item added in the previous test
                try {
                    var result = Meteor.call('getFeedItem', testItem._id);
                    assert(result._id == testItem._id);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
            });
        });

        describe('updateFeedItem()', () => {
            beforeEach(() => {
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;
            });

            afterEach(() => {
                Items.remove({});
            });

            it("should fail updating a feed item with non-Object input", (done) => {
                // Update item with wrong parameter
                try {
                    Meteor.call('updateFeedItem', false);
                } catch (err) {
                    done();
                }

                assert.fail();
            });

            it("should fail if logged in user is not item creator", (done) => {
                // Update item with wrong parameter
                global.Meteor.userId.returns(userId + 1);
                var newTestItem = {
                    _id: testItem._id,
                    type: testItem.type,
                    sticky: !testItem.sticky
                };

                try {
                    Meteor.call('updateFeedItem', newTestItem);
                } catch (err) {
                    done();
                }

                assert.fail();
            });

            it("should fail updating clubID/creatorID/type/createdAt", (done) => {
                // Update item with wrong parameter
                var newTestItem = {
                    _id: testItem._id,
                    type: testItem.type,
                    clubID: testItem.clubID + 1
                };
                try {
                    var result = Meteor.call('updateFeedItem', newTestItem);
                    console.log(testItem.clubID);
                    console.log(result.clubID, newTestItem.clubID);
                } catch (err) {
                    console.log(err);
                    done();
                }
                assert.fail();
            });

            it("should succeed updating a feed item", () => {
                // Update testItem to newTestItem
                try {
                    var newTestItem = {
                        _id: testItem._id,
                        type: testItem.type,
                        sticky: !testItem.sticky
                    };
                    var result = Meteor.call('updateFeedItem', newTestItem);
                    assert(result.sticky == newTestItem.sticky);
                    testItem = result;
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('putResponse()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;

                // Add schema to Responses
                Responses.attachSchema(baseResponseSchema, {selector: {itemType: testItem.type}});
            });

            afterEach(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should throw error with non-String id", (done) => {
                // Invalid id
                try {
                    Meteor.call('putResponse', false, testItem.type, '1');
                } catch (err) {
                    done();
                }

                assert.fail();
            });

            it("should throw error with non-String type", (done) => {
                // Invalid id type
                try {
                    Meteor.call('putResponse', testItem._id, false, '1');
                } catch (err) {
                    done();
                }

                assert.fail();
            });

            it("should throw error with non-String response value", (done) => {
                // Invalid value
                try {
                    Meteor.call('putResponse', testItem._id, testItem.type, false);
                } catch (err) {
                    done();
                }

                assert.fail();
            });

            it("should add response successfully with valid input", () => {
                // Valid input          
                try {
                    Meteor.call('putResponse', testItem._id, testItem.type, '1');
                } catch (err) {
                    assert.fail(err.message);
                }
            });
        });

        describe('getResponse()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;

                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            afterEach(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should throw error with non-String item ID", (done) => {
                // Get item with wrong parameter
                try {
                    Meteor.call('getResponse', false);
                } catch (err) {
                    done();
                }

                assert.fail();
            });

            it("should get the response successfully", () => {
                // Get response added in the previous test
                try {
                    result = Meteor.call('getResponse', testItem._id);
                } catch (err) {
                    assert.fail();
                }

                assert.equal(result.itemID, testItem._id);
            });
        });

        describe('getResponseOfOneItem()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;

                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            afterEach(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should throw error with non-String item ID", (done) => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getResponsesOfOneItem', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should get an empty array of responses for item without responses", () => {
                // Get responses of item without responses
                try {
                    result = Meteor.call('getResponsesOfOneItem', 'otherItem');
                } catch (err) {
                    assert.fail();
                }

                assert.equal(result.length, 0);
            });

            it("should get the responses on a feed item", () => {
                // Get responses of item added in the previous test
                try {
                    result = Meteor.call('getResponsesOfOneItem', testItem._id);
                } catch (err) {
                    assert.fail();
                }

                assert.equal(result.length, 1);
                assert.equal(result[0].itemID, testItem._id);
            });
        });

        describe('getNumberResponsesOfOneItem()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;

                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            afterEach(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should throw error with wrong parameters ", (done) => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getNumberResponsesOfOneItem', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should get 0 responses for item without responses ", () => {
                // Get responses of item without responses
                try {
                    result = Meteor.call('getNumberResponsesOfOneItem', 'otherItem');
                } catch (err) {
                    assert.fail();
                }
                assert.equal(result, 0);
            });

            it("should get 1 response for an item with 1 response", () => {
                // Get responses of item added in the previous test
                try {
                    result = Meteor.call('getNumberResponsesOfOneItem', testItem._id);
                } catch (err) {
                    assert.fail();
                }
                assert.equal(result, 1);
            });
        });

        describe('getResponseOfItemType()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;

                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            afterEach(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should throw error with invalid parameters", (done) => {
                // Get responses with wrong parameter
                try {
                    Meteor.call('getResponsesOfItemType', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should get an empty array for an item type that does not have responses", () => {
                // Get responses of item without responses
                try {
                    result = Meteor.call('getResponsesOfItemType', 'otherItemType');
                } catch (err) {
                    assert.fail();
                }
                assert.equal(result.length, 0);
            });

            it("should get all responses of given item type", () => {
                // Get responses of item added in the previous test
                try {
                    var result = Meteor.call('getResponsesOfItemType', testItem.type);
                } catch (err) {
                    console.log(err);
                    assert.fail();
                }
                assert(result.length == 1);
            });
        });

        describe('getVotingResults()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;

                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            afterEach(() => {
                Items.remove({});
                Responses.remove({});
            });

            it("should throw error with invalid parameters", (done) => {
                // Get results with wrong parameter
                try {
                    Meteor.call('getVotingResults', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should get the voting results", () => {
                // Get results of item added in the previous test
                try {
                    result = Meteor.call('getVotingResults', testItem._id);
                    assert.equal(result[0].length, 3);
                    assert.equal(result[0][0], 1);
                    assert.equal(result[0][1], 0);
                    assert.equal(result[0][2], 0);
                } catch (err) {
                    assert.fail(err.message);
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
                } catch (err) {
                    assert.fail(err.message);
                }
            });
        });

        describe('deleteResponse()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;

                Meteor.call('putResponse', testItem._id, testItem.type, '1');
            });

            afterEach(() => {
                Items.remove({});
            });

            it("should throw error with invalid parameter", (done) => {
                // Delete response with wrong parameter
                try {
                    Meteor.call('deleteResponse', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should delete response", () => {
                try {
                    Meteor.call('deleteResponse', testItem._id);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('deleteFeedItem()', () => {
            beforeEach(() => {
                // Insert an item into database
                var itemId = Meteor.call('addFeedItem', testItem);
                check(itemId, String);
                testItem._id = itemId;
            });

            afterEach(() => {
                Items.remove({});
            });

            it("should throw error with invalid parameter", (done) => {
                // Delete item with wrong parameter
                try {
                    Meteor.call('deleteFeedItem', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should delete the feed item", () => {
                // Delete item added in the addFeedItem test case
                try {
                    Meteor.call('deleteFeedItem', testItem._id);
                    var result = Items.find(testItem._id).count();
                    assert.equal(result, 0);
                } catch (err) {
                    assert.fail();
                }
            });
        });

        describe('trainings()', () => {
            it("should get trainings", () => {
                // Try to get some trainings
                try {
                    result = Meteor.call('getTrainings');

                    // Check training ID's to validate the result
                    _.each(result, function (training) {
                        check(training.trId, String);
                    });
                } catch (err) {
                    assert.fail();
                }
            });

            it("should throw error with invalid parameters", (done) => {
                // Get exercises for invalid type parameter.
                try {
                    Meteor.call('getExercises', false);
                } catch (err) {
                    done();
                }
                assert.fail();
            });

            it("should retrieve exercise successfully", (done) => {
                var trainings = Meteor.call('getTrainings');
                if (trainings.length <= 0) done();
                try {
                    result = Meteor.call('getExercises', trainings[0].trId);
                } catch (err) {
                    assert.fail();
                }

                // Check exercise ID's to validate the result
                _.each(result, function (exercise) {
                    check(exercise.exId, String)
                });
                done();
            });
        });
    });
}