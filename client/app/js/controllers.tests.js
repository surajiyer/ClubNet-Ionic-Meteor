import 'angular-mocks';
import { assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import './controllers'
import '/model/Feed'

describe('feedCtrl', () => {
    var scope, ctrl;

    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(angular.mock.module('app.controllers'));
    beforeEach(inject(($rootScope, $controller, _CoachAccess_) => {
        scope = $rootScope.$new();
        ctrl = $controller('feedCtrl', {
            $scope: scope,
            CoachAccess: _CoachAccess_
        });
    }));

    it("logs in user", function() {
        assert.isTrue(true);
    });

    it('should create 4 feed item types', () => {
        assert.equal(scope.itemTypes.length, 4);
    });
});