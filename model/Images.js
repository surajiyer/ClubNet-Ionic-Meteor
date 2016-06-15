Images = new FS.Collection("images", {
    stores: [new FS.Store.FileSystem("images")],
    filter: {
        maxSize: 2048576, // in bytes
        allow: {
            contentTypes: ['image/*']
        },
        onInvalid: function (message) {
            if (Meteor.isClient) {
                alert(message);
            } else {
                console.log(message);
            }
        }
    }
});

Meteor.startup(function () {
    Images.allow({
        insert: function (userId) {
            var isValidUser = !!userId && userId == Meteor.userId() && Meteor.user().profile.type == "pr";
            return isValidUser;
        },
        remove: function (userId) {
            var isValidUser = !!userId && userId == Meteor.userId() && Meteor.user().profile.type == "pr";
            return isValidUser;
        },
        download: function (userId) {
            var isValidUser = !!userId && userId == Meteor.userId() && Meteor.user().profile.type == "pr";
            return isValidUser;
        },
        update: function (userId) {
            var isValidUser = !!userId && userId == Meteor.userId() && Meteor.user().profile.type == "pr";
            return isValidUser;
        }
    });
});