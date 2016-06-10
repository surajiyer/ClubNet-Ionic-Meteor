import 'angular-mocks';
import './services';
import '/model/Chats';
import {Meteor} from 'meteor/meteor';

describe('Chat', () => {
    var Chats;

    beforeEach(angular.mock.module('angular-meteor'));
    beforeEach(angular.mock.module('app.services'));
    beforeEach(inject(function (Chat) {
        Chats = Chat;
    }));

    it("Get Chats", (done) => {
        // Mock user
        Meteor.userId = sinon.stub().returns('user1');
        Meteor.user = sinon.stub().returns({
            profile: {type: 'coach'}
        });
        Meteor.userId = sinon.stub().returns('user1');
        Meteor.user = sinon.stub().returns({
            profile: {type: 'coach'}
        });

        console.log('Meteor.user() front-end');
        console.log(Meteor.user());
        var result1 = Chats.createChat('user2');
        if(result1) {
            done();
        } else {
            assert.fail();
        }
    });
});