SimpleSchema.messages({
    invalidDeadline: 'Deadline must be after current time',
    maxVotes: 'Number of votes [value] cannot exceed allowed number of voters'
});

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
    creatorID: {
        type: String,
        denyUpdate: true
    },
    type: {
        type: String,
        denyUpdate: true
    },
    sticky: {
        type: Boolean,
        optional: true,
        autoValue: function(){
            if (this.isInsert) {
                return false;
            }
        }
    },
    clubID: {
        type: String,
        denyUpdate: true
    },
    published: {
        type: Boolean
    },
    published: {
        type: Boolean,
        defaultValue: true
    },
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            if (this.isInsert) {
                return new Date;
            }
        },
        denyUpdate: true
    },
    modifiedAt: {
        type: Date,
        optional: true,
        autoValue: function () {
            return new Date;
        }
    }
});

/**
 * Database schema for exercises
 * @type {SimpleSchema}
 */
const exerciseSchema = new SimpleSchema({
    _id: {type: String},
    name: {type: String},
    image: {
        type: String,
        regEx: SimpleSchema.RegEx.Url
    }
});

/**
 * Database schema for Voting polls
 * @type {SimpleSchema}
 */
const votingPollSchema = new SimpleSchema([baseFeedItemSchema, {
    title: {type: String},
    deadline: {
        type: Date,
        custom: function () {
            // if deadline is before current time, give Invalid deadline error
            if (this.value < new Date) return "invalidDeadline";
        }
    },
    training_id: {
        type: String
    },
    exercises: {
        type: [exerciseSchema],
        minCount: 3,
        maxCount: 3
    },
    training_id: {
        type: String
    },
    intermediatePublic: {
        type: Boolean,
        optional: true,
        autoValue: function () {
            if (this.isInsert)
                return true;
        }
    },
    finalPublic: {
        type: Boolean,
        optional: true,
        autoValue: function () {
            if (this.isInsert)
                return true;
        }
    },
    nrVoters: {
        type: Number,
        min: 1
    },
    nrVotes: {
        type: Number,
        min: 0,
        optional: true,
        autoValue: function () {
            if (this.isInsert)
                return 0;
        },
        custom: function () {
            // Set nrVoters field as a custom max value for nrVotes
            if (this.value > this.siblingField('nrVoters').value)
                return "maxVotes";
        }
    },
    ended: {
        type: Boolean,
        optional: true,
        autoValue: function () {
            return new Date > this.siblingField('deadline').value;
        }
    },
    teamID: {
        type: String,
        denyUpdate: true
    }
}]);

/**
 * Database schema for Form
 * @type {SimpleSchema}
 */
const formSchema = new SimpleSchema([baseFeedItemSchema, {
    title: {type: String},
    description: {type: String},
    teamID: {
        type: String,
        denyUpdate: true
    },
    repeatInterval: {
        type: String,
        optional: true
    },
    target: {type: String},
    targetValue: {
        type: Number,
        min: 0
    },
    raisedValue: {
        type: Number,
        optional: true,
        min: 0,
        autoValue: function() {
            if (this.isInsert)
                return 0;
        }
    },
    locked: {
        type: Boolean,
        optional: true,
        autoValue: function () {
            return this.siblingField('raisedValue').value >= this.siblingField('targetValue').value;
        }
    }
}]);

/**
 * Database schema for Heroes
 * @type {SimpleSchema}
 */
const heroesSchema = new SimpleSchema([baseFeedItemSchema, {
    title: {type: String},
    text: {type: String},
    image: {type: String}
}]);

/**
 * Database schema for betting match
 * @type {SimpleSchema}
 */
const matchSchema = new SimpleSchema({
    team1: {type: String},
    team2: {type: String},
    result: {type: String}
});

/**
 * Database schema for Betting rounds
 * @type {SimpleSchema}
 */
const bettingRoundSchema = new SimpleSchema({
    matches: {
        type: [matchSchema],
        minCount: 3,
        maxCount: 5
    },
    deadline: {type: Date},
    season: {type: String}
});

/**
 * Database schema for Sponsoring
 * @type {SimpleSchema}
 */
const sponsorEventSchema = new SimpleSchema([baseFeedItemSchema, {
    title: {type: String},
    description: {type: String},
    targetAmount: {type: Number},
    raisedAmount: {type: Number}
}]);

/**
 * Database schema for Exercise suggestions
 * @type {SimpleSchema}
 */
const exerciseSuggestionSchema = new SimpleSchema([baseFeedItemSchema, {
    teamID: {
        type: String,
        denyUpdate: true
    },
    playerID: {type: String},
    suggestion: {type: String}
}]);

export {baseFeedItemSchema};
export {feedItemTypesSchema};

export default feedItemSchemas = {
    'Voting': votingPollSchema,
    'Form': formSchema,
    'Heroes': heroesSchema,
    'Betting': bettingRoundSchema,
    'Sponsor': sponsorEventSchema,
    'Suggestion': exerciseSuggestionSchema
};