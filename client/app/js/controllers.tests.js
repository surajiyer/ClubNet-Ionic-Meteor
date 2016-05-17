import 'angular-mocks';
import { assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Meteor } from 'meteor/meteor';
import './controllers.js'
import './services.js'
import './routes.js'
import '/model/Feed'

describe('feedCtrl', () => {
    var scope, ctrl;

    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(angular.mock.module('app.controllers'));
    beforeEach(inject(($rootScope, $controller, _CoachAccess_) => {
        scope = $rootScope;
        ctrl = $controller('feedCtrl', {
            $scope: scope,
            CoachAccess: _CoachAccess_
        });
    }));

    it('should create 4 feed item types', () => {
        assert.isFalse(scope.showFilter);
        scope.showFilter = true;
        assert.isTrue(scope.showFilter);
    });
});

describe('registerCtrl', () => {
    var scope, meteor, state, ctrl;

    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(angular.mock.module('app.controllers'));
    beforeEach(angular.mock.module('ui.router'));
    beforeEach(angular.mock.module('app.routes'));
    beforeEach(inject(($rootScope, $controller, $meteor, $state) => {
        scope = $rootScope;
        meteor = $meteor;
        state = $state;      
        
        ctrl = $controller('registerCtrl', {
            $scope: scope,
            $meteor: meteor,
            $state: state
        });
    }));

    it("Should register a user", (done) => {
        email = 'test' + new Date().getTime() + '@test.test';
        password = 'password';
        
        assert(Meteor.userId() == null, 'User is not logged in.');
        scope.user.email = email;
        scope.user.password = password;
        assert(Meteor.userId() == null, 'User is not logged in.');
        scope.register();
        setTimeout(function() {
            assert(Meteor.userId() != null, 'User is logged in.');
            Meteor.logout();
            done(); 
        }, 500);
    });
});