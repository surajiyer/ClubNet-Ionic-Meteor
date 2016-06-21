export let userTypes = ['coach', 'player', 'pr', 'general'];

export const getUserById = function (userId) {
    check(userId, String);
    return Meteor.users.find({_id: userId}).fetch()[0];
};

export const getUserType = function (userId) {
    var user = getUserById(userId);
    return user.profile.type;
};

export const getUserClubID = function (userId) {
    var user = getUserById(userId);
    return user.profile.clubID;
};

export const getUserTeamID = function (userId) {
    var user = getUserById(userId);
    return user.profile.teamID;
};

export const isAdmin = function (userId) {
    return getUserType(userId) == 'pr';
};

export const getAllItemTypes = function () {
    return TypesCollection.find().fetch();
};

export const isValidType = function (itemType) {
    check(itemType, String);
    var validTypes = _.pluck(getAllItemTypes(), '_id');
    return _.contains(validTypes, itemType);
};