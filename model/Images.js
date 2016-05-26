Images = new FS.Collection("images", {
    stores: [new FS.Store.FileSystem("images")]
});
if (Meteor.isServer) {

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

    Meteor.methods({

        getImage: function(){
            return Images.find().fetch()[0];
        }
    })

    Meteor.publish('images', function() {
        return Images.find({});
    });
}
