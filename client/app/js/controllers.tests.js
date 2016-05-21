import 'angular-mocks';
import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import './controllers.js';
import './services.js';
import './routes.js';
import '/model/Feed';

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

    it("Should throw an error", (done) => {
        var email = 'register';
        var password = 'password';
        Meteor.logout();
        var spy = sinon.spy(scope, 'register');
        setTimeout(function() {
            //scope.user.email = email;
            scope.user.password = password;
            try {
                scope.register();
            }
            catch (err) {
                console.log('Hurray');
            }
            finally {
                setTimeout(function() {
                    //assert(Meteor.userId() != null, 'User is logged in.');
                    //console.log(spy.threw());
                    assert(spy.threw(), 'true');
                    done();
                }, 500);
            }
        }, 100);
    });

    it("Should register a user and be able to retrieve it", (done) => {
        var email = 'register' + new Date().getTime() + '@test.test';
        var password = 'password';
        Meteor.logout();
        var spy = sinon.spy(scope, 'register');
        setTimeout(function() {
            scope.user.email = email;
            scope.user.password = password;
            try {
                scope.register();
            }
            catch (err) {
                console.log('Hurray');
            }
            finally {
                setTimeout(function() {
                    console.log(Accounts.findUserByEmail(email));
                    //assert(Meteor.userId() != null, 'User is logged in.');
                    //console.log(spy.threw());
                    assert(spy.threw(), 'true');
                    done();
                }, 500);
            }
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

    it("Should log in and go to feed", (done) => {
        email = 'login' + new Date().getTime() + '@test.test';
        password = 'password';
        var spy = sinon.spy(state, 'go');

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
                        assert.equal(spy.calledWith('menu.feed'), true);
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

    it("Should go to forgot password page", (done) => {
        var spy = sinon.spy(state, 'go');

        Meteor.logout();
        scope.goToRemindPassword();
        setTimeout(function() {
            assert.equal(spy.calledWith('forgotPassword'), true);
            done();
        }, 500);
    });

});

describe('menuCtrl', () => {
    setupTesting('menuCtrl');

    it("Should log out and go to login page", (done) => {
        var spy = sinon.spy(state, 'go');
        setTimeout(() => {
            scope.logout();
            assert.equal(spy.calledWith('login'), true);
            done();
        }, 100);
    });
});

describe('forgotPasswordCtrl', () => {
    setupTesting('forgotPasswordCtrl');


});

