import 'angular-mocks';
import './services';
import '/model/Chats.js';
import {Meteor} from 'meteor/meteor';

describe('Chat', () => {
    var service;

    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(inject(function (Chat) {
        service = Chat;
    }));
   
    it("Get Chats", (done) => {

        // Mock user
        global.Meteor.userId = sinon.stub().returns('user1');
        global.Meteor.user = sinon.stub().returns({
                profile : { type : 'coach'}
            });
        Meteor.userId = sinon.stub().returns('user1');
        Meteor.user = sinon.stub().returns({
                profile : { type : 'coach'}
            });

        console.log('Meteor.user() front-end');
        console.log(Meteor.user());
        result1 = service.createChat('user2');
        done();
    });
});