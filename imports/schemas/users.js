/**
 * Database schema for user profile
 * @type {SimpleSchema}
 */
UserProfile = new SimpleSchema({
    firstName: {type: String},
    lastName: {type: String},
    type: {type: String, allowedValues: ['coach', 'player', 'general']},
    clubID: {type: String},
    bettingResults: {
        type: [{
            season: {type: String},
            points: {type: Number}
        }],
        optional: true
    }
});

/**
 * Database schema for user accounts
 * @type {SimpleSchema}
 */
baseUserSchema = new SimpleSchema({
    username: {
        type: String,
        optional: true
    },
    emails: {
        type: Array,
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {type: UserProfile},
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    heartbeat: {
        type: Date,
        optional: true
    }
});

/**
 * Database schema for coach
 * @type {SimpleSchema}
 */
coachSchema = new SimpleSchema([UserProfile, {
    teamID: {type: String},
    notes: {
        type: [{
            itemID: {type: String},
            text: {type: String}
        }],
        optional: true
    }
}]);

/**
 * Database schema for player
 * @type {SimpleSchema}
 */
playerSchema = new SimpleSchema([UserProfile, {
    teamID: {type: String}
}]);

export default userSchemas = {
    'general': baseUserSchema,
    'coach': coachSchema,
    'player': playerSchema
};