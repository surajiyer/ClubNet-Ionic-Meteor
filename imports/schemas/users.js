import * as utils from '/imports/common';
import { notesSchema } from '/imports/schemas/misc';

/**
 * Database schema for user profile
 * @type {SimpleSchema}
 */
const UserProfile = new SimpleSchema({
    firstName: {type: String},
    lastName: {type: String},
    type: {
        type: String,
        allowedValues: utils.userTypes
    },
    clubID: {type: String},
    bettingResults: {
        type: [{
            season: {type: String},
            points: {type: Number}
        }],
        optional: true
    },
    teamID: {
        type: String,
        optional: true,
        custom: function () {
            var shouldBeRequired = this.siblingField('type').value == 'coach'
                || this.siblingField('type').value == 'player';
            if (shouldBeRequired) {
                // inserts
                if (!this.operator) {
                    if (!this.isSet || this.value === null || this.value === "") return "required";
                }

                // updates
                else if (this.isSet) {
                    if (this.operator === "$set" && this.value === null || this.value === "") return "required";
                    if (this.operator === "$unset") return "required";
                    if (this.operator === "$rename") return "required";
                }
            } else {
                if(value !== null && value.length > 0) return 'notAllowed';
            }
        }
    },
    notes: {
        type: [notesSchema],
        optional: true,
        custom: function () {
            var shouldBeRequired = this.siblingField('type').value == 'coach';
            if (shouldBeRequired) {
                // updates
                if (this.isSet) {
                    if (this.operator === "$set" && this.value === null || this.value === "") return "required";
                    if (this.operator === "$unset") return "required";
                    if (this.operator === "$rename") return "required";
                }
            } else {
                if(value !== null && value.length > 0) return 'notAllowed';
            }
        }
    },
    notifications: {
        type: Object,
        blackbox: true
    }
});

/**
 * Database schema for user accounts
 * @type {SimpleSchema}
 */
const baseUserSchema = new SimpleSchema({
    createdAt: {
        type: Date
    },
    username: {
        type: String,
        optional: true
    },
    emails: {
        type: [Object],
        optional: true
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    profile: {
        type: UserProfile
    },
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

export default userSchema = baseUserSchema;
export {baseUserSchema as userSchema, UserProfile as userProfileSchema}