import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import * as utils from '/imports/common';
import './Chats';

var ChatsAllowSpy = sinon.spy(Chats, 'allow');

if (Meteor.isClient) {
    describe('Chat', function () {
        var allow, chatRightsStub, sameClub, sameTeam, userType;
        
        beforeEach(function () {
            allow = ChatsAllowSpy.getCall(0).args[0];
        });

        describe('insert', function () {
                // Give chat create permission
            before(function () {
                chatRightsStub = sinon.stub(Meteor, 'call');
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'create')
                    .returns(true);
                sinon.stub(global.Meteor, 'userId').returns('1');
            });

            after(function () {
                chatRightsStub.restore();
                sinon.restore(global.Meteor.userId);
            });

            it("should deny insert access to non-logged in users", function () {
                var response = allow.insert(null, {});
                assert.equal(response, false);
            });

            it("should deny remove access for a non-existing user", function () {
                var response = allow.remove('', {});
                assert.equal(response, false);
            });

            it("should deny insert access to non-participating user", function () {
                var response = allow.insert('1', {});
                assert.equal(response, false);
            });

            it("should deny insert access to non-same club users", function () {
                sameClub = sinon.stub(utils, 'getUserClubID');
                sameClub.withArgs('1').returns(true);
                sameClub.withArgs('2').returns(false);
                sameTeam = sinon.stub(utils, 'getUserTeamID');
                sameTeam.returns(false);
                var response = allow.insert('1', {users: ['1', '2']});
                sameClub.restore();
                sameTeam.restore();
                assert.equal(response, false);
            });

            it("should deny insert access to non-same team, but same club, users", function () {
                sameClub = sinon.stub(utils, 'getUserClubID');
                sameClub.returns(true);
                sameTeam = sinon.stub(utils, 'getUserTeamID');
                sameTeam.withArgs('1').returns(true);
                sameTeam.withArgs('2').returns(false);
                var response = allow.insert('1', {users: ['1', '2']});
                sameClub.restore();
                sameTeam.restore();
                assert.equal(response, false);
            });

            it("should deny insert access to same team and same club but no create rights", function () {
                sameClub = sinon.stub(utils, 'getUserClubID');
                sameClub.withArgs('1').returns(true);
                sameClub.withArgs('2').returns(true);
                sameTeam = sinon.stub(utils, 'getUserTeamID');
                sameTeam.withArgs('1').returns(true);
                sameTeam.withArgs('2').returns(true);
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'create')
                    .returns(false);
                var response = allow.insert('1', {users: ['1', '2']});
                sameClub.restore();
                sameTeam.restore();
                assert.equal(response, false);
            });
            
            it("should allow insert access to same team and same club with the user having create rights", function () {
                sameClub = sinon.stub(utils, 'getUserClubID');
                sameClub.withArgs('1').returns(true);
                sameClub.withArgs('2').returns(true);
                sameTeam = sinon.stub(utils, 'getUserTeamID');
                sameTeam.withArgs('1').returns(true);
                sameTeam.withArgs('2').returns(true);
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'create')
                    .returns(true);
                var response = allow.insert('1', {users: ['1', '2']});
                sameClub.restore();
                sameTeam.restore();
                assert.equal(response, true);
            });
        });

        describe('update', function () {
            // Give chat create permission
            before(function () {
                chatRightsStub = sinon.stub(Meteor, 'call');
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'edit')
                    .returns(true);
                sinon.stub(global.Meteor, 'userId').returns('1');
            });

            after(function () {
                chatRightsStub.restore();
                sinon.restore(global.Meteor.userId);
            });

            it("should deny update access for a non-logged in users", function () {
                userType = sinon.stub(utils, 'getUserType');
                userType.withArgs('1').returns('');
                var response = allow.update(null, {}, false);
                userType.restore();
                assert.equal(response, false);
            });

            it("should deny remove access for a non-existing user", function () {
                var response = allow.remove('', {});
                assert.equal(response, false);
            });

            it("should deny update access for a non-participating user", function () {
                userType = sinon.stub(utils, 'getUserType');
                userType.withArgs('1').returns('');
                var response = allow.update('1', {}, false);
                userType.restore();
                assert.equal(response, false);
            });
            
            it("should deny update access for a player editing non-last message", function () {
                userType = sinon.stub(utils, 'getUserType');
                userType.withArgs('1').returns('player');
                var response = allow.update('1', {users: ['1', '2']}, ['non-last message']);
                userType.restore();
                assert.equal(response, false);
            });

            it("should deny update access for a player for his last message with a closed chat", function () {
                userType = sinon.stub(utils, 'getUserType');
                userType.withArgs('1').returns('player');
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'edit')
                    .returns(true);
                var response = allow.update('1', {users: ['1', '2'], status: 'closed'}, ['lastMessage']);
                userType.restore();
                assert.equal(response, false);
            });

            it("should deny update access for a coach for his all messages with a closed chat", function () {
                userType = sinon.stub(utils, 'getUserType');
                userType.withArgs('1').returns('coach');
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'edit')
                    .returns(true);
                var response = allow.update('1', {users: ['1', '2'], status: 'closed'}, ['non-last message']);
                userType.restore();
                assert.equal(response, false);
            });

            it("should allow update access for a player for his last message with a open chat", function () {
                userType = sinon.stub(utils, 'getUserType');
                userType.withArgs('1').returns('player');
                var response = allow.update('1', {users: ['1', '2'], status: 'open'}, ['lastMessage']);
                userType.restore();
                assert.equal(response, true);
            });

            it("should allow update access for a coach for his all messages with a open chat", function () {
                userType = sinon.stub(utils, 'getUserType');
                userType.withArgs('1').returns('coach');
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'edit')
                    .returns(true);
                var response = allow.update('1', {users: ['1', '2'], status: 'open'}, ['non-last message']);
                userType.restore();
                assert.equal(response, true);
            });
        });

        describe('remove', function () {
            // Give chat create permission
            before(function () {
                chatRightsStub = sinon.stub(Meteor, 'call');
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'edit')
                    .returns(true);
                sinon.stub(global.Meteor, 'userId').returns('1');
            });

            after(function () {
                chatRightsStub.restore();
                sinon.restore(global.Meteor.userId);
            });

            it("should deny remove access for a non-logged in users", function () {
                var response = allow.remove(null, {});
                assert.equal(response, false);
            });

            it("should deny remove access for a non-existing user", function () {
                var response = allow.remove('', {});
                assert.equal(response, false);
            });

            it("should deny remove access for a non-participating user", function () {
                var response = allow.remove('1', {});
                assert.equal(response, false);
            });

            it("should deny remove access for a user without delete rights", function () {
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'delete')
                    .returns(false);
                chatRightsStub
                    .withArgs('checkRights', 'Messages', 'delete')
                    .returns(false);
                var response = allow.remove('1', {users: ['1', '2'], status: 'open'});
                userType.restore();
                assert.equal(response, false);
            });

            it("should allow remove access for a user with delete rights", function () {
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'delete')
                    .returns(true);
                chatRightsStub
                    .withArgs('checkRights', 'Messages', 'delete')
                    .returns(true);
                var response = allow.remove('1', {users: ['1', '2'], status: 'open'});
                userType.restore();
                assert.equal(response, true);
            });
        });
    });
}