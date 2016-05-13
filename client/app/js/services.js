angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('AccessControl', function() {
    // Define subscriptions here
    var subscriptionReady = new ReactiveVar(false);
    var AMxHandle = Meteor.subscribe("accessControl");
    Meteor.callSync = Meteor.wrapAsync(Meteor.call, Meteor);

    Tracker.autorun(function() {
        subscriptionReady.set(AMxHandle.ready());
    });

    this.subReady = subscriptionReady;

    /**
     * Check if user is permitted to get access to various aspects of the service.
     * @param role the type of user eg.: coach, player...
     * @param itemType the item for which permission is being requested
     * @param permission the type of permission being requested for the item: create, view, edit or delete.
     * @returns true if allowed or false if denied
     */
    this.getPermission = function(role, itemType, permission, callback) {
        if(!subscriptionReady.get())
            throw new Meteor.Error('Subscription not ready');
        if(typeof role !== 'string')
            throw new Meteor.Error('Role must be a string');
        if(typeof itemType !== 'string')
            throw new Meteor.Error('Item type must be a string');
        if(typeof permission !== 'string')
            throw new Meteor.Error('Permission required must be a string');

        var doc = Meteor.call('checkRights', role, itemType, function(err, doc) {
            if(err) return;
            console.log(doc);
            callback(doc.items[0].permissions[permission]);
        });
    };
})

.service('CoachAccess', function(AccessControl) {
    this.showCoachBar = new ReactiveVar(false);
    var self = this;
    Tracker.autorun(function() {
        if(AccessControl.subReady.get()) {
            AccessControl.getPermission("coach", "coachbar", "view", function(bool) {
                self.showCoachBar.set(bool);
            });
        }
    });
});