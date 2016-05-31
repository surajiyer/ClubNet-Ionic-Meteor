export let userTypes = ['coach', 'player', 'pr', 'general'];

export const getUserType = function (userId) {
    check(userId, String);
    return Meteor.users.find({_id: userId}).fetch()[0].profile.type;
};

export const getUserClubID = function (userId) {
    check(userId, String);
    return Meteor.users.find({_id: userId}).fetch()[0].profile.clubID;
};

export const getUserTeamID = function (userId) {
    check(userId, String);
    return Meteor.users.find({_id: userId}).fetch()[0].profile.teamID;
};

export const isAdmin = function (userId) {
    return getUserType(userId) == 'pr';
};

export const isValidType = function (itemType) {
    check(itemType, String);
    var validTypes = _.pluck(Meteor.call('getItemTypes'), '_id');
    return _.contains(validTypes, itemType);
};