/**
 * Database schema for item types
 * @type {SimpleSchema}
 */
const feedItemTypesSchema = new SimpleSchema({
    _id: {type: String},
    name: {type: String},
    icon: {type: String}
});

/**
 * Database schema for basic feed item
 * @type {SimpleSchema}
 */
const baseFeedItemSchema = new SimpleSchema({
    creatorID:{type: String},
    type :{type: String},
    sticky:{type: Boolean},
    clubID:{type: String},
    status:{type: String, allowedValues:["published","unpublished"]}
});

/**
 * Database schema for exercises
 * @type {SimpleSchema}
 */
const exerciseSchema = new SimpleSchema({
    name:{type:String},
    image:{type:String}
});

/**
 * Database schema for Voting polls
 * @type {SimpleSchema}
 */
const votingPollSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type:String},
    deadline:{type:Date},
    results:{type:[{
        teamID: {type: String},
        result:{type: Number}}
    ]},
    exercises:{
        type:[exerciseSchema],
        minCount: 3,
        maxCount: 3
    },
    intermediatePublic:{type:Boolean},
    finalPublic:{type:Boolean},
    nrVoters:{type:Number},
    nrVotes:{type: Number},
    ended:{type:Boolean},
    teamID:{type:String}
}]);

/**
 * Database schema for Heroes
 * @type {SimpleSchema}
 */
const heroesSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type: String},
    text:{type:String},
    image:{type: String}
}]);

/**
 * Database schema for betting match
 * @type {SimpleSchema}
 */
const matchSchema = new SimpleSchema({
    team2:{type: String},
    team1:{type: String},
    result:{type: String}
});

/**
 * Database schema for Betting rounds
 * @type {SimpleSchema}
 */
const bettingRoundSchema = new SimpleSchema({
    matches:{type:[matchSchema], minCount : 3, maxCount: 5},
    deadLine:{type:Date},
    season:{type: String}
});

/**
 * Database schema for Form
 * @type {SimpleSchema}
 */
const formSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type: String},
    description:{type:String},
    repeatInterval:{type: String},
    target:{type:String},
    targetValue:{type: Number},
    raised:{type:Number},
    locked:{type: Boolean},
    teamID:{type:String}
}]);

/**
 * Database schema for Sponsoring
 * @type {SimpleSchema}
 */
const sponsorEventSchema = new SimpleSchema([baseFeedItemSchema,{
    title:{type:String},
    targetAmount:{type:Number},
    raisedAmount:{type:Number},
    description:{type: String}
}]);

/**
 * Database schema for Exercise suggestions
 * @type {SimpleSchema}
 */
const exerciseSuggestionSchema = new SimpleSchema([baseFeedItemSchema,{
    teamID:{type: String},
    playerID:{type : String},
    suggestion:{type: String}
}]);

export { feedItemTypesSchema };

export default feedItemSchemas = {
    'Base': baseFeedItemSchema,
    'Heroes': heroesSchema,
    'Form': formSchema,
    'Sponsor': sponsorEventSchema,
    'Voting': votingPollSchema,
    'Suggestion': exerciseSuggestionSchema,
    'Betting': bettingRoundSchema
};