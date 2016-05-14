Meteor.publish('userManagement', function publishFunction() {
    return Meteor.users.find({});
});