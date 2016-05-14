import 'angular-mocks';
import './services.js';
import '/model/AccessControl'

describe('Access control', () => {
    var ac;

    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(inject(function(_AccessControl_) {
        ac = _AccessControl_;
    }));

    it('should grant coach permission to view voting', function() {
        Tracker.autorun(function() {
            if(ac.subReady.get()) {
                ac.getPermission("coach", "voting", "view", function(bool) {
                    console.log("Hi");
                    expect(bool).toBe(true);
                });
            }
        });
    });
});