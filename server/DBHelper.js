/**
 * Created by Chen on 5/13/2016.
 */
myusers = new Mongo.Collection("myusers");
myitems = new Mongo.Collection("myitems");
myresponses = new Mongo.Collection("myresponses");
mynotes = new Mongo.Collection("mynotes");
myitemtypes = new Mongo.Collection("myitemtypes");
var feedItemSchemas = {
    'base':baseFeedItemSchema,
    'heroes': heroesSchema,
    'form': formSchema,
    'sponsor event': sponsorEventSchema,
    'voting poll': votingPollSchema,
    'exercise suggestion': exerciseSuggestionSchema,
    'betting': bettingRoundSchema}
var userSchemas = {
    'general member': baseUserSchema,
    'coach': coachSchema,
    'player': playerSchema,
};
var responseSchemas = {
    'heroes': baseResponseSchema,
    'form': baseResponseSchema,
    'sponsor event': baseResponseSchema,
    'voting poll': votingPollSchema,
    'exercise suggestion': baseResponseSchema,
    'betting':bettingResponseSchema
};
var teamMembers = ["coach", "player"];

Meteor.methods({
    'DBHelper.getTypeItem': function(itemID){
        try{
            return myitems.find({_id: itemID}).fetch()[0].itemType;
        }catch(err){
            console.log(err.message);
        }
    },
    'DBHelper.getTeamID': function(userID){
        try{
            return myusers.find({_id: userID}).fetch()[0].clubID;
        }catch(err){
            console.log(err.message);
        }
    },
    'attachSchemas': function(){
        for(var key in userSchemas){
            myusers.attachSchema(userSchemas[key], {selector:{userType: key}});
        }
        for(var key in feedItemSchemas){
            myitems.attachSchema(feedItemSchemas[key], {selector:{itemType: key}});
        }
        for(var key in responseSchemas){
            myresponses.attachSchema(responseSchemas[key], {selector:{itemType: key}});
        }
    },
    'DBHelper.addUser': function(newUser){
        try{
            if(teamMembers.indexOf(newUser.userType) != -1){
                newUser.notes = [];
            }
            newUser.bettingResults = [];
            myusers.insert(newUser);
            console.log("added new user");
        }catch(err){
            console.log(err.message);
        }
    },
    'DBHelper.addFeedItem': function(newItem){
        try{
            myitems.insert(newItem);
            console.log("added new item");
        }catch(err){
            console.log(err.message);
        }
    },
    'DBHelper.addResponse': function(newResponse){
        try{
            newResponse.itemType = Meteor.call('DBHelper.getTypeItem', newResponse._id);
            myresponses.insert(newResponse);
            console.log("added new response");
        }catch(err){
            console.log(err);
        }
    },
    'DBHelper.addNote': function(newNote){
        try{
            myusers.update({
                _id:newNote.creatorID
            },{$push:{'notes':{
                itemID: newNote.itemID,
                text: newNote.text
            }}},{bypassCollection2: true});
            console.log("added new note");
        }catch(err){
            console.log(err);
        }
    },
    'DBHelper.updateNote': function(newNote){
        try{
            myusers.update({
                _id:newNote.creatorID,
                notes:{$elemMatch:{itemID: newNote.itemID}}},
                {$set:{
                    "notes.$.text": newNote.text
                }},{bypassCollection2: true});
            console.log("updated new note");
        }catch(err){
            console.log(err);
        }
    },
    'DBHelper.updateUserInfo': function(userID, newInfo){
        try{
            var setPar = {};
            for(var key in newInfo){
                setPar[key] = newInfo[key];
                myusers.update({_id:userID},{$set:setPar},{bypassCollection2: true});
            }
            console.log("updated user info");
        }catch(err){
            console.log(err);
        }
    },
    "DBHelper.updateFeedItemInfo": function(itemID, newInfo){
        var setPar = {};
        for(var key in newInfo){
            setPar[key] = newInfo[key];
            myitems.update({_id:itemID},{$set:setPar},{bypassCollection2: true});
        }
        console.log("updated feed item info");
    },
    "DBHelper.deleteUser": function(userID){
        try{
            myusers.remove({_id:userID});
        }catch(err){
            console.log(err.message);
        }
    },
    "DBHelper.deleteFeedItem": function(itemID){
        try{
            myitems.remove({_id:itemID});
        }catch(err){
            console.log(err.message);
        }
    },
    "DBHelper.deleteResponse": function(response){
        try{
            myresponses.remove({itemID: response.itemID, responsorID: response.responsorID})
        }catch(err){
            console.log(err.message);
        }
    },
    "DBHelper.getPredefinedItemTypes": function(){
        try{
            var types = {};
            myitemtypes.find().forEach(function(type){
                types[type.itemType] = type.icon;
            })
            return types;
        }catch(err){
            console.log(err.message);
        }
    },
    "DBHelper.getUserInfo": function(userID){
        try{
            return myusers.find({_id: userID});
        }catch(err){
            console.log(err.message);
        }
    },
    "DBHelper.getFeed": function(userID, itemTypes){
        try{
            var clubid = myusers.find({_id: userID}).fetch()[0].clubID;
            var teamid = myusers.find({_id: userID}).fetch()[0].teamID;
            console.log(myitems.find({
                itemType: {$in: itemTypes},
                status: 'published',
                clubID: clubid,
                $or: [
                    {
                        teamID: {$exists: true, $eq: teamid },
                    },
                    {
                        teamID: {$exists: false},
                    }
                ]
            }).count());
        }catch(err){
            console.log(err.message);
        }

    },
    "DBHelper.getResponsesOfOneItem()": function(itemID){
        try{
            return myresponses.find({itemID: itemID});
        }catch(err){
            console.log(err.message);
        }
    }

});

var user1 = {
    _id: "1",
    userType: "coach",
    email: "siminchen@live.com",
    firstName: "Simin",
    lastName: "Chen",
    password: "123456",
    clubID: "1",
    teamID:"1",
}
var user2 = {
    _id: "2",
    userType: "coach",
    email: "siminchen@live.com",
    firstName: "newSimin",
    lastName: "newChen",
    password: "new123456",
    clubID: "1",
    teamID:"1",
}
var item1 = {
    _id: "1",
    creatorID : "1",
    itemType: "heroes",
    clubID:"1",
    sticky: false,
    title:"my hero",
    text:"my hero is myself.",
    image:"tue.nl/pic1",
    status:"published"
}
var item2 = {
    _id: "2",
    creatorID : "1",
    itemType: "form",
    clubID:"1",
    sticky: false,
    title:"my form",
    repeatInterval:"Month",
    target:"driving",
    targetValue: 8,
    raised:0,
    locked:false,
    teamID:"1",
    status: "published"
}
var response1 = {
    _id: "1",
    responserID:"1",
    itemID:"1",
    value:1
}
var note1 = {
    creatorID: "1",
    itemID: "1",
    text:"my first note."
}
var note2 = {
    creatorID: "1",
    itemID: "1",
    text:"my first new note."
}
var newUserInfo1 = {
    firstName: "newSimin",
    lastName:"newChen",
    password: "newPasswod"
}
var newFeedItemInfo1 = {
    title: "my new hero",
    text:"my new hero is you",
    sticky: true,
}
myusers.remove({});
myitems.remove({});
myresponses.remove({});
myitemtypes.remove({});
myitemtypes.insert({itemType: "heroes", icon :"tue.nl/icon"})
Meteor.call('attachSchemas');
Meteor.call('DBHelper.addUser',user1);
Meteor.call('DBHelper.addFeedItem',item1);
Meteor.call('DBHelper.addFeedItem',item2);
Meteor.call('DBHelper.addResponse',response1);
Meteor.call("DBHelper.addNote", note1);
Meteor.call("DBHelper.updateNote", note2);
Meteor.call("DBHelper.updateUserInfo", "1",newUserInfo1);
Meteor.call("DBHelper.updateFeedItemInfo", "1",newFeedItemInfo1);
Meteor.call("DBHelper.getPredefinedItemTypes");
Meteor.call("DBHelper.getFeed","1",["heroes","form"]);
//console.log(toReturn.fetch());