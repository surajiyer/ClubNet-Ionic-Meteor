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
        insert: function () {
            return true;
        },
        remove: function () {
            return true;
        },
        download: function () {
            return true;
        },
        update: function () {
            return true;
        }
    });

});