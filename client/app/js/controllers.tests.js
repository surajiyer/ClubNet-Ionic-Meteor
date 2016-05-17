import 'angular-mocks';
import { assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Meteor } from 'meteor/meteor';
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
        email = 'register' + new Date().getTime() + '@test.test';
        password = 'password';
        
        Meteor.logout();
        setTimeout(function() {
            assert(Meteor.userId() == null, 'User is not logged in.');
            scope.user.email = email;
            scope.user.password = password;
            assert(Meteor.userId() == null, 'User is not logged in.');
            scope.register();
            setTimeout(function() {
                assert(Meteor.userId() != null, 'User is logged in.');
                done(); 
            }, 500);
        }, 100);
    });
});

describe('profileCtrl', () => {
    setupTesting('profileCtrl');
    var userAccount;
    
    beforeEach(inject((UserAccount) => {
        userAccount = UserAccount;
    }));

    it("Should change password", (done) => {
        email = 'test' + new Date().getTime() + '@test.test';
        password = 'password';
        Meteor.logout();
        setTimeout(function() {
            userAccount.register(
                email,
                password,
                function() {
                    console.log('Register successfull');
                    scope.temp_pass.oldPass = password;
                    scope.temp_pass.newPass = password + '1';
                    scope.temp_pass.newPassCheck = password
                    scope.changePassword();
                    setTimeout(function() {
                        assert(scope.error != '', 'Change password should throw an error.');
                        scope.error = '';
                        scope.temp_pass.newPassCheck = password + '1';
                        scope.changePassword();
                        setTimeout(function() {
                            assert(scope.error == '', 'Change password should not throw an error.');
                            done();
                        }, 500);
                    }, 500);
                },
                function(error) {
                    console.log('Register error: ' + error); // Output error if registration fails
                    assert.fail();
                }
            );
        }, 100);
    });
});

describe('loginCtrl', () => {
    setupTesting('loginCtrl');
    var userAccount;
    
    beforeEach(inject((UserAccount) => {
        userAccount = UserAccount;
    }));

    it("Should change password", (done) => {
        email = 'login' + new Date().getTime() + '@test.test';
        password = 'password';
        
        Meteor.logout();
        setTimeout(function() {
            assert(Meteor.userId() == null, 'User should not be logged in.');
            userAccount.register(
                email,
                password,
                function() {
                    console.log('Register successfull');
                    Meteor.logout();
                    scope.user.email = email;
                    scope.user.password = password;
                    scope.login();
                    setTimeout(function() {
                        assert(Meteor.userId() != null, 'User should be logged in.');
                        done(); 
                    }, 500);
                },
                function(error) {
                    console.log('Register error: ' + error); // Output error if registration fails
                    assert.fail();
                }
            );
        }, 100);
    });
});
