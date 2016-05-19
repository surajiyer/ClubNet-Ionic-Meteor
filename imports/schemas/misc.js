/**
 * Database schema for teams
 * @type {SimpleSchema}
 */
var teamSchema = new SimpleSchema({
    teamName: {type: String},
    teamID: {type: String}
});

/**
 * Database schema for clubs
 * @type {SimpleSchema}
 */
var clubSchema = new SimpleSchema({
    name: {type: String},
    logo: {type: String},
    colorSchema: {
        type: [String],
        label: "Three colors",
        minCount: 3,
        maxCount: 3
    }
});

export {teamSchema, clubSchema};