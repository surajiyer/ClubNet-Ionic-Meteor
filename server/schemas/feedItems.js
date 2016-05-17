/**
 * Created by Chen on 5/13/2016.
 */
//feed item base schema
baseFeedItemSchema = new SimpleSchema({
    creatorID:{type: String},
    itemType :{type: String},
    sticky:{type: Boolean},
    clubID:{type: String},
    status:{type: String, allowedValues:["published","unpublished"]}
})
//voting poll schema
votingPollSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type:String},
    deadline:{type:Date},
    results:{type:[{
        teamID: {type: String},
        result:{type: Number}}
    ]},
    exercises:{type:[exerciseSchema], minCount : 3,maxCount: 3},
    intermediatePublic:{type:Boolean},
    finalPublic:{type:Boolean},
    nrVoters:{type:Number},
    nrVotes:{type: Number},
    ended:{type:Boolean},
    teamID:{type:String}
}])
//heroes schema
heroesSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type: String},
    text:{type:String},
    image:{type: String}
}])
//betting round schema
matchSchema = new SimpleSchema({
    team2:{type: String},
    team1:{type: String},
    result:{type: String}
})
bettingRoundSchema = new SimpleSchema({
    matches:{type:[matchSchema], minCount : 3, maxCount: 5},
    deadLine:{type:Date},
    season:{type: String}
})

//form schema
formSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type: String},
    description:{type:String},
    repeatInterval:{type: String},
    target:{type:String},
    targetValue:{type: Number},
    raised:{type:Number},
    locked:{type: Boolean},
    teamID:{type:String}
}])
//sponsor schema
sponsorEventSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type:String},
    targetAmount:{type:Number},
    raisedAmount:{type:Number},
    description:{type: String}
}])
//suggestion schema
exerciseSuggestionSchema = new SimpleSchema([baseFeedItemSchema,{
    teamID:{type: String},
    playerID:{type : String},
    suggestion:{type: String}
}])