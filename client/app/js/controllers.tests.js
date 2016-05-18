import 'angular-mocks';
import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import './controllers.js'
import './services.js'
import './routes.js'
import '/model/Feed'

var scope, meteor, state, ctrl;

function setupTesting(ctrlName) {
    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(angular.mock.module('app.controllers'));
    beforeEach(angular.mock.module('ui.router'));
    beforeEach(angular.mock.module('app.routes'));
    beforeEach(inject(($rootScope, $controller, $meteor, $state) => {
        scope = $rootScope;
        meteor = $meteor;
        state = $state;

        ctrl = $controller(ctrlName, {
            $scope: scope,
            $meteor: meteor,
            $state: state
        });
    }));
}

describe('registerCtrl', () => {
    setupTesting('registerCtrl');

    it("Should register a user", (done) => {
        email = 'test' + new Date().getTime() + '@test.test';
        password = 'password';

        Meteor.logout();
        assert(Meteor.userId() == null, 'User is not logged in.');
        scope.user.email = email;
        scope.user.password = password;
        assert(Meteor.userId() == null, 'User is not logged in.');
        scope.register();
        setTimeout(function () {
            assert(Meteor.userId() != null, 'User is logged in.');
            Meteor.logout();
            done();
        }, 500);
    });
});
