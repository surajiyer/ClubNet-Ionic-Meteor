import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import 'angular-mocks';

describe("Login system", function() {
    beforeEach(function() {
        // load ng app
    });
    it("logs in user", function() {
        assert.isTrue(true);
    });
});

// describe('appControllers', function() {
//     beforeEach(angular.mock.module('app.controllers'));
//     describe('register', function() {
//         it('should register a user',
//             inject(function($rootScope, $controller) {

//             var scope = $rootScope.$new();
//             var ctrl = $controller("registerCtrl", {$scope: scope });
//             scope.user = 'jarno3@verhagen.nl';
//             scope.password = 'wachtwoord';
//             scope.register();
//             assert.isTrue(Meteor.userId());
//         }));
//     });
// });

describe('App controllers', function () {
  var scope, createController;
  
  beforeEach(angular.mock.module('app.controllers'));
  
  beforeEach(inject(function ($injector) {
    var $rootScope = $injector.get('$rootScope');
    var $controller = $injector.get('$controller');
    
    scope = $rootScope.$new();
    
    createController = function () {
      return $controller('registerCtrl', {$scope: scope});
    };
  }));
  
  assert.isTrue(true);
  
  afterEach(function () {
    scope.$destroy();
  });
});