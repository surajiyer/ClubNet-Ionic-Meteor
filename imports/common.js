const userTypes = ['coach', 'player', 'general'];

/**
 * Check if user is a PR user.
 * @returns {boolean}
 */
const isAdmin = function (userId) {
    // TODO: check if PR user
    check(userId, String);
    return true;
};

const isValidType = function (itemType) {
    check(itemType, String);
    var validTypes = _.pluck(Meteor.call('getItemTypes'), '_id');
    return _.contains(validTypes, itemType);
};

export {userTypes, isAdmin, isValidType};