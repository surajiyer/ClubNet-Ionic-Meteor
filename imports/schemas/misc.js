import * as utils from '/imports/common';

/**
 * Database schema for feed item notes
 * @type {SimpleSchema}
 */
const notesSchema = new SimpleSchema({
    itemID: {type: String},
    text: {type: String}
});

/**
 * Database schema for teams
 * @type {SimpleSchema}
 */
const teamSchema = new SimpleSchema({
    teamName: {type: String},
    teamID: {type: String}
});

/**
 * Database schema for clubs
 * @type {SimpleSchema}
 */
const clubSchema = new SimpleSchema({
    name: {type: String},
    logo: {type: String},
    colorPrimary: {type: String},
    colorSecondary: {type: String},
    colorAccent: {type: String},
    heroesMax: {type: Number}
});

const permissionSchema = new SimpleSchema({
    _id: {
        type: String,
        custom: function () {
            if(!utils.isValidType(this.value)) return "notAllowed";
        }
    },
    permissions: {type: Object},
    'permissions.create': {
        type: Boolean,
        defaultValue: false
    },
    'permissions.edit': {
        type: Boolean,
        defaultValue: false
    },
    'permissions.view': {
        type: Boolean,
        defaultValue: false
    },
    'permissions.delete': {
        type: Boolean,
        defaultValue: false
    }
});

utils.userTypes.push('yolo');
console.log(utils.userTypes);

/**
 * Database schema for Access Control
 * @type {SimpleSchema}
 */
const accessControlSchema = new SimpleSchema({
    _id: {
        type: String,
        allowedValues: utils.userTypes
    },
    items: {
        type: [permissionSchema]
    }
});

export {notesSchema, teamSchema, clubSchema, accessControlSchema};