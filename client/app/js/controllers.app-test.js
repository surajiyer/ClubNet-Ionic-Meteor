import 'angular-mocks';
import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Tracker} from 'meteor/tracker';
import './controllers.js';
import './services.js';
import './routes.js';
import '/model/Feed';
//import '/model/Chats';

import { TypesCollection } from '../../../model/ItemTypes.js';

var scope, meteor, state, ctrl;
//van 3 tot 5

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

describe('feedCtrl', () => {
    setupTesting('feedCtrl');
    var accessControl;

    beforeEach(inject((AccessControl) => {
        accessControl = AccessControl;
    }));

    //Kevin
    it("Should print ItemTypes", (done) => {
        meteor.subscribe();
        setTimeout(() => {
            console.log(scope.itemTypes);
            done();
        }, 500);
    });
});