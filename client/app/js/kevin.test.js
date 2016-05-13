/* eslint-env mocha */

import 'angular-mocks';
import './controllers.js'
import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';


describe('feedCtrl', () => {
    var scope, ctrl;

    beforeEach(angular.mock.module('app.controllers'));
    beforeEach(inject(($rootScope, $controller) => {
        scope = $rootScope;
        ctrl = $controller('feedCtrl', {$scope:scope});
    }));

    console.log("hi");

    it('should create 4 feed item types', () => {
        assert.equal(scope.itemTypes.length, 4);
    });
});