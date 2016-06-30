export let userTypes = ['coach', 'player', 'pr', 'general'];

/**
 * @summary Function to get user information with give user ID.
 * @param userId String Object ID of user
 * @returns {Object} User object
 */
export const getUserById = function (userId) {
    check(userId, String);
    return Meteor.users.find({_id: userId}).fetch()[0];
};

/**
 * @summary Get user type of given user ID.
 * @param userId String Object ID of user
 * @returns {String} user type eg.: 'coach', 'pr' etc.
 */
export const getUserType = function (userId) {
    var user = getUserById(userId);
    return user.profile.type;
};

/**
 * @summary Get ID of the club that user of given user ID is part of.
 * @param userId String Object ID of user
 * @returns {String} club ID eg.: 'PSV' etc.
 */
export const getUserClubID = function (userId) {
    var user = getUserById(userId);
    return user.profile.clubID;
};

/**
 * @summary Get ID of the team that user of given user ID is part of.
 * @param userId String Object ID of user
 * @returns {String} team ID
 */
export const getUserTeamID = function (userId) {
    var user = getUserById(userId);
    return user.profile.teamID;
};

/**
 * @summary Check if user is a PR user or not.
 * @param userId String Object ID of user
 * @returns {Boolean} true if user is a 'pr' user, otherwise false.
 */
export const isAdmin = function (userId) {
    return getUserType(userId) == 'pr';
};

/**
 * @summary Get all item types in database.
 * @returns {Object[]} Array of item type objects.
 */
export const getAllItemTypes = function () {
    return TypesCollection.find().fetch();
};

/**
 * @summary Check if the given item type is defined in database.
 * @param itemType String Object ID of item type
 * @returns {Boolean} true if item type exists, otherwise false.
 */
export const isValidType = function (itemType) {
    check(itemType, String);
    var validTypes = _.pluck(getAllItemTypes(), '_id');
    return _.contains(validTypes, itemType);
};