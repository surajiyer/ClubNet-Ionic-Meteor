/**
 * Database base schema for responses
 * @type {SimpleSchema}
 */
baseResponseSchema = new SimpleSchema({
    userID: {type: String},
    itemID: {type: String},
    itemType: {type: String},
    value: {type: String}
});

/**
 * Database schema for betting responses
 * @type {SimpleSchema}
 */
bettingResponseSchema = new SimpleSchema({
    userID: {type: String},
    itemID: {type: String},
    bets: {type: [String], allowedValues: ["win", "lose", "tie", "none"]}
});

export {baseResponseSchema};
export default responseSchemas = {
    'Voting': baseResponseSchema,
    'Form': baseResponseSchema,
    'Heroes': baseResponseSchema,
    'Betting': bettingResponseSchema,
    'Sponsor': baseResponseSchema,
    'Suggestion': baseResponseSchema
};