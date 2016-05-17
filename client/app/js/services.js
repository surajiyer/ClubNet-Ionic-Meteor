angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('AccessControl', function() {
    /**
     * Check if user is permitted to get access to various aspects of the service.
     * @param role the type of user eg.: coach, player...
     * @param itemType the item for which permission is being requested
     * @param permission the type of permission being requested for the item: create, view, edit or delete.
     * @param callback function to call with the result as argument
     */
    this.getPermission = function(role, itemType, permission, callback) {
        Meteor.call('checkRights', role, itemType, permission, function(err, result) {
            if(err) throw new Meteor.Error(err.error);
            if(typeof result !== 'boolean')
                throw new Meteor.Error('Unexpected result type');
            callback(result);
        });
    };
})

.service('CoachAccess', ['AccessControl', function(ac) {
    self = this;
    this.showCoachBar = new ReactiveVar(false);

    Tracker.autorun(function() {
        ac.getPermission('coach', 'coachbar', 'view', function(result) {
            self.showCoachBar.set(result);
        });
    });
}])
    
// .service('AccessControl', function() {
//     // Define subscriptions here
//     var subscriptionReady = new ReactiveVar(false);
//     var AMxHandle = Meteor.subscribe("accessControl");
//     Meteor.callSync = Meteor.wrapAsync(Meteor.call, Meteor);
//
//     Tracker.autorun(function() {
//         subscriptionReady.set(AMxHandle.ready());
//     });
//
//     /**
//      * Services which depend on this service must check the subReady condition to ensure subscription to Access
//      * Control collection is ready prior to requesting permissions. Utilise the subReady variable inside a reactive
//      * computation like Tracker.autorun or Template helpers.
//      * @type {ReactiveVar}
//      */
//     this.subReady = subscriptionReady;
//
//     /**
//      * Check if user is permitted to get access to various aspects of the service.
//      * @param role the type of user eg.: coach, player...
//      * @param itemType the item for which permission is being requested
//      * @param permission the type of permission being requested for the item: create, view, edit or delete.
//      * @param callback
//      */
//     this.getPermission = function(role, itemType, permission, callback) {
//         if(!subscriptionReady.get())
//             throw new Meteor.Error('Subscription not ready');
//
//         Meteor.call('checkRights', role, itemType, permission, function(err, doc) {
//             if(err) throw new Meteor.Error(err.error);
//             callback(doc);
//         });
//     };
// })
//
// .service('CoachAccess', function(AccessControl) {
//     self = this;
//     this.showCoachBar = new ReactiveVar(false);
//
//     Tracker.autorun(function() {
//         if(AccessControl.subReady.get()) {
//             AccessControl.getPermission('coach', 'coachbar', 'view', function(result) {
//                 if(typeof result !== 'boolean')
//                     throw new Meteor.Error('Unexpected result type');
//                 console.log(result);
//                 self.showCoachBar.set(result);
//             });
//         }
//     });
// });