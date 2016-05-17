/**
 * Created by Chen on 5/13/2016.
 */
Responses = new Mongo.Collection("myresponses");
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
            return Items.find({_id: itemID}).fetch()[0].itemType;
        }catch(err){
            console.log(err.message);
        }
    },
    'DBHelper.getTeamID': function(userID){
        try{
            return Meteor.users.find({_id: userID}).fetch()[0].clubID;
        }catch(err){
            console.log(err.message);
        }
    },
    'attachSchemas': function(){
        for(var key in userSchemas){
            Meteor.users.attachSchema(userSchemas[key], {selector:{userType: key}});
        }
        for(var key in feedItemSchemas){
            TypesCollection.attachSchema(feedItemSchemas[key], {selector:{itemType: key}});
        }
        for(var key in responseSchemas){
            Responses.attachSchema(responseSchemas[key], {selector:{itemType: key}});
        }
    },
    'DBHelper.addUser': function(newUser){
        try{
            if(teamMembers.indexOf(newUser.userType) != -1){
                newUser.notes = [];
            }
            newUser.bettingResults = [];
            Meteor.users.insert(newUser);
            console.log("added new user");
        }catch(err){
            console.log("addUser():"+err.message);
        }
    },
    'DBHelper.addFeedItem': function(newItem){
        try{
            Items.insert(newItem);
            console.log("added new item");
        }catch(err){
            console.log("addFeedItem()"+err.message);
        }
    },
    'DBHelper.addResponse': function(newResponse){
        try{
            newResponse['itemType'] = Meteor.call('DBHelper.getTypeItem', newResponse._id);
            Responses.insert(newResponse);
            console.log("added new response");
        }catch(err){
            console.log("addResponse():"+err);
        }
    },
    'DBHelper.addNote': function(newNote){
        try{
            Meteor.users.update({
                _id:newNote.creatorID
            },{$push:{'notes':{
                itemID: newNote.itemID,
                text: newNote.text
            }}},{bypassCollection2: true});
            console.log("added new note");
        }catch(err){
            console.log("addNote():"+err);
        }
    },
    'DBHelper.updateNote': function(newNote){
        try{
            Meteor.users.update({
                _id:newNote.creatorID,
                notes:{$elemMatch:{itemID: newNote.itemID}}},
                {$set:{
                    "notes.$.text": newNote.text
                }},{bypassCollection2: true});
            console.log("updated new note");
        }catch(err){
            console.log("updateNote():"+err);
        }
    },
    'DBHelper.updateUserInfo': function(userID, newInfo){
        try{
            var setPar = {};
            for(var key in newInfo){
                setPar[key] = newInfo[key];
                Meteor.users.update({_id:userID},{$set:setPar},{bypassCollection2: true});
            }
            console.log("updated user info");
        }catch(err){
            console.log("updateUserInfo():"+err);
        }
    },
    "DBHelper.updateFeedItemInfo": function(itemID, newInfo){
        try{
            var setPar = {};
            for(var key in newInfo){
                setPar[key] = newInfo[key];
                Items.update({_id:itemID},{$set:setPar},{bypassCollection2: true});
            }
            console.log("updated feed item info");
        }catch(err){
            console.log("updateFeedItemInfo():"+err.message)
        }

    },
    "DBHelper.deleteUser": function(userID){
        try{
            Meteor.users.remove({_id:userID});
        }catch(err){
            console.log("deleteUser():"+err.message);
        }
    },
    "DBHelper.deleteFeedItem": function(itemID){
        try{
            Items.remove({_id:itemID});
        }catch(err){
            console.log("deleteFeedItem(): "+err.message);
        }
    },
    "DBHelper.deleteResponse": function(response){
        try{
            Responses.remove({itemID: response.itemID, responsorID: response.responsorID})
        }catch(err){
            console.log("deleteResponse(): "+err.message);
        }
    },
    "DBHelper.getPredefinedItemTypes": function(){
        try{
            var types = {};
            TypesCollection.find().forEach(function(type){
                types[type.itemType] = type.icon;
            })
            return types;
        }catch(err){
            console.log("getPredefinedItemTypes(): "+err.message);
        }
    },
    "DBHelper.getUserInfo": function(userID){
        try{
            return Meteor.users.find({_id: userID});
        }catch(err){
            console.log("getUserInFo():"+err.message);
        }
    },
    "DBHelper.getFeed": function(userID, itemTypes){
        try{
            var clubid = Meteor.users.find({_id: userID}).fetch()[0].clubID;
            var teamid = Meteor.users.find({_id: userID}).fetch()[0].teamID;
            return Items.find({
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
            }).fetch();
        }catch(err){
            console.log("getFeed(): "+err.message);
        }

    },
    "DBHelper.getResponsesOfOneItem": function(itemID){
        try{
            return Responses.find({itemID: itemID});
        }catch(err){
            console.log("getResponseOfOneItem():"+err.message);
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
Meteor.users.remove({});
Items.remove({});
Responses.remove({});
TypesCollection.remove({});
TypesCollection.insert({_id: "heroes", name:"Heroes!", icon :"tue.nl/icon"});
TypesCollection.insert({_id: "form", name:"Form!", icon :"tue.nl/icon"});
TypesCollection.insert({_id: "voting", name:"Vote for exercise@!", icon :"tue.nl/icon"});
//Meteor.call('attachSchemas');
//Meteor.call('DBHelper.addUser',user1);
Meteor.call('DBHelper.addFeedItem',item1);
Meteor.call('DBHelper.addFeedItem',item2);
Meteor.call('DBHelper.addResponse',response1);
Meteor.call("DBHelper.addNote", note1);
Meteor.call("DBHelper.updateNote", note2);
Meteor.call("DBHelper.updateUserInfo", "1",newUserInfo1);
Meteor.call("DBHelper.updateFeedItemInfo", "1",newFeedItemInfo1);
Meteor.call("DBHelper.getPredefinedItemTypes");
Meteor.call("DBHelper.getFeed","1",["heroes","form"]);
console.log(TypesCollection.find().fetch());
console.log(Meteor.users.find().fetch());