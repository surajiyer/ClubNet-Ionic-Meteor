import clubSchema from '/imports/schemas/responses';
Clubs = new Mongo.Collection("Clubs");
Meteor.startup(function () {
    Clubs.allow({
        // only allow posting if you are logged in and other validations
        insert: function (userId, doc) {
            return true;
        },
        update: function (userId, doc) {
            return true;
        },
        remove: function (userId, doc) {
            return true;
        }
    });



    if (Meteor.isServer) {
        Meteor.publish('Clubs', function () {
            var clubID = Meteor.users.find({_id: this.userId}).fetch()[0].profile.clubID;
            return Clubs.find({_id: clubID});
        });
    }
});


if (Meteor.isServer) {
    Meteor.methods({
        updateClub: function (updatedItem) {
            check(updatedItem, Object);
            var clubID = Meteor.user().profile.clubID;
            Clubs.update(
                {_id: clubID},
                {$set: updatedItem}
            );

            return true;
        },
        getClub: function(){
            var clubID = Meteor.user().profile.clubID;
            return Clubs.find({_id: clubID}).fetch()[0];
        }
    })
}