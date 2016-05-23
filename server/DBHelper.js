Meteor.methods({
    'DBHelper.addFeedItem': function (newItem) {
        console.log(newItem);
        try {
            Items.insert(newItem);
            console.log("added new item");
        } catch (err) {
            console.log("addFeedItem()" + err.message);
        }
    },
    "DBHelper.getFeedItemByCreatedAt": function (date) {
        try {
            return Items.find({createdAt: date}).fetch();
        } catch (err) {
            console.log("getFeedItemByTimestamp():" + err.message);
        }
    },
    'DBHelper.addNote': function (newNote) {
        try {
            Meteor.users.update({
                _id: newNote.creatorID
            }, {
                $push: {
                    'notes': {
                        itemID: newNote.itemID,
                        text: newNote.text
                    }
                }
            }, {bypassCollection2: true});
            console.log("added new note");
        } catch (err) {
            console.log("addNote():" + err);
        }
    },
    'DBHelper.updateNote': function (newNote) {
        try {
            Meteor.users.update({
                    _id: newNote.creatorID,
                    notes: {$elemMatch: {itemID: newNote.itemID}}
                },
                {
                    $set: {
                        "notes.$.text": newNote.text
                    }
                }, {bypassCollection2: true});
            console.log("updated new note");
        } catch (err) {
            console.log("updateNote():" + err);
        }
    },
    'DBHelper.updateUserInfo': function (userID, newInfo) {
        try {
            var setPar = {};
            for (var key in newInfo) {
                setPar[key] = newInfo[key];
                Meteor.users.update({_id: userID}, {$set: setPar}, {bypassCollection2: true});
            }
            console.log("updated user info");
        } catch (err) {
            console.log("updateUserInfo():" + err);
        }
    },
    "DBHelper.updateFeedItemInfo": function (itemID, newInfo) {
        try {
            Items.update(
                {_id: itemID},
                {$set: newInfo},
                {bypassCollection2: true}
            );
            console.log("updated feed item info");
        } catch (err) {
            console.log("updateFeedItemInfo():" + err.message)
        }

    },
    "DBHelper.deleteFeedItem": function (itemID) {
        try {
            Items.remove({_id: itemID});
        } catch (err) {
            console.log("deleteFeedItem(): " + err.message);
        }
    },

    "DBHelper.getPredefinedItemTypes": function () {
        try {
            var types = {};
            TypesCollection.find().forEach(function (type) {
                types[type.itemType] = type.icon;
            });
            return types;
        } catch (err) {
            console.log("getPredefinedItemTypes(): " + err.message);
        }
    },
    "DBHelper.getUserInfo": function (userID) {
        try {
            return Meteor.users.find({_id: userID}).fetch();
        } catch (err) {
            console.log("getUserInFo():" + err.message);
        }
    },
    "DBHelper.getResponsesOfOneItem": function (itemID) {
        try {
            return Responses.find({itemID: itemID}).fetch();
        } catch (err) {
            console.log("getResponseOfOneItem():" + err.message);
        }
    },
    "DBHelper.getVotingResults": function (itemID) {
        try {
            votes = Responses.find({itemID: itemID});
            result = [[0,0,0]];
            votes.forEach(function(vote) {result[0][vote.value-1]++;});
            return result;          
        } catch (err) {
            console.log("doesResponseExist():" + err.message);
        }
    },
    "DBHelper.doesResponseExist": function (itemID, userID) {
        try {
            var responses =  Responses.find({itemID: itemID, userID: userID}).fetch();
            if (responses.length > 0) {
                return responses[0].value;
            } else {
                return 0;
            }
        } catch (err) {
            console.log("doesResponseExist():" + err.message);
        }
    },
    "DBHelper.deleteResponse": function (response) {
        try {
            Responses.remove({itemID: response.itemID, responsorID: response.responsorID})
        } catch (err) {
            console.log("deleteResponse(): " + err.message);
        }
    },
    "DBHelper.getResponsesOfItemType": function (itemType) {
        try {
            return Responses.find({itemType: itemType}).fetch();
        } catch (err) {
            console.log("getResponsesOfItemType(): " + err.message);
        }
    },
    "DBHelper.putResponse": function (itemID, userID, itemType, value) {
        try {
            Responses.insert({itemID: itemID, userID: userID, itemType: itemType, value: value});
        } catch (err) {
            console.log("putResponse(): " + err.message);
        }
    }
});