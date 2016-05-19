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

// var user1 = {
//     _id: "1",
//     userType: "coach",
//     email: "siminchen@live.com",
//     firstName: "Simin",
//     lastName: "Chen",
//     password: "123456",
//     clubID: "1",
//     teamID:"1",
// }
// var item1 = {
//     _id: "1",
//     creatorID : "1",
//     itemType: "heroes",
//     clubID:"1",
//     sticky: false,
//     title:"my hero",
//     text:"my hero is myself.",
//     image:"tue.nl/pic1",
//     status:"published"
// }
// var item2 = {
//     _id: "2",
//     creatorID : "1",
//     itemType: "form",
//     clubID:"1",
//     sticky: false,
//     title:"my form",
//     description:"driving!!!",
//     repeatInterval:"Month",
//     target:"driving",
//     targetValue: 8,
//     raised:0,
//     locked:false,
//     teamID:"1",
//     status: "published"
// }
// var response1 = {
//     _id: "1",
//     responserID:"1",
//     itemID:"1",
//     value:1
// }
// var note1 = {
//     creatorID: "1",
//     itemID: "1",
//     text:"my first note."
// }
// var note2 = {
//     creatorID: "1",
//     itemID: "1",
//     text:"my first new note."
// }
// var newUserInfo1 = {
//     firstName: "newSimin",
//     lastName:"newChen",
//     password: "newPasswod"
// }
// var newFeedItemInfo1 = {
//     title: "my new hero",
//     text:"my new hero is you",
//     sticky: true,
// }
// Meteor.users.remove({});
// Items.remove({});
// Responses.remove({});
// TypesCollection.remove({});
// TypesCollection.insert({_id: "heroes", name:"Heroes!", icon :"tue.nl/icon"});
// Meteor.call('attachSchemas');
// Meteor.call('DBHelper.addUser',user1);
// TypesCollection.insert({_id: "form", name:"Form!", icon :"tue.nl/icon"});
// TypesCollection.insert({_id: "voting", name:"Vote for exercise@!", icon :"tue.nl/icon"});
// Meteor.call('DBHelper.addFeedItem', item1);
// Meteor.call('DBHelper.addFeedItem', item2);
// Meteor.call('DBHelper.addResponse', response1);
// Meteor.call("DBHelper.addNote", note1);
// Meteor.call("DBHelper.updateNote", note2);
// Meteor.call("DBHelper.updateUserInfo", "1", newUserInfo1);
// Meteor.call("DBHelper.updateFeedItemInfo", "1", newFeedItemInfo1);
// Meteor.call("DBHelper.getPredefinedItemTypes");
// Meteor.call("DBHelper.getFeed", "1", ["heroes", "form"]);