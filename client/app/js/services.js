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

    /**
     * Services which depend on this service must check the subReady condition to ensure subscription to Access
     * Control collection is ready prior to requesting permissions. Utilise the subReady variable inside a reactive
     * computation like Tracker.autorun or Template helpers.
     * @type {ReactiveVar}
     */
    this.subReady = subscriptionReady;

    /**
     * Check if user is permitted to get access to various aspects of the service.
     * @param role the type of user eg.: coach, player...
     * @param itemType the item for which permission is being requested
     * @param permission the type of permission being requested for the item: create, view, edit or delete.
     * @param callback
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

        Meteor.call('checkRights', role, itemType, function(err, doc) {
            if(err) return;
            Tracker.autorun(function() {
                console.log(doc.fetch());
                callback(doc.items[0].permissions[permission]);
            });
            //callback(doc.items[0].permissions[permission]);
        });
    };
})

.service('CoachAccess', function(AccessControl) {
    this.showCoachBar = new ReactiveVar(false);
    self = this;

    Tracker.autorun(function() {
        if(AccessControl.subReady.get()) {
            AccessControl.getPermission("coach", "coachbar", "view", function(bool) {
                self.showCoachBar.set(bool);
            });
        }
    });
});