import {assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import './Chats';

var ChatsAllowSpy = sinon.spy(Chats, 'allow');

if (Meteor.isClient) {
    describe('Chat', function () {
        var allow, chatRightsStub;

        beforeEach(function () {
            allow = ChatsAllowSpy.getCall(0).args[0];
        });

        describe('insert', function () {
            beforeEach(function () {
                // Give chat create permission
                chatRightsStub = sinon.stub(Meteor, 'call');
                chatRightsStub
                    .withArgs('checkRights', 'Chat', 'create')
                    .returns(true);
            });

            it("deny access to non-logged in users", function () {
                var response = allow.insert(null, {});
                assert.equal(response, false);
            });
        });

        // // Fake user data
        // var testAdmin = {
        //     email: 'pr@test',
        //     password: 'pr',
        //     profile: {
        //         firstName: "I am",
        //         lastName: "PR",
        //         type: "pr",
        //         clubID: "club1"
        //     }
        // };
        // var testUser1 = {
        //     email: 'y@y',
        //     password: 'y',
        //     profile: {
        //         firstName: "I am",
        //         lastName: "testUser1",
        //         type: "coach",
        //         clubID: "club1",
        //         teamID: "team1"
        //     }
        // };
        // var testUser2 = {
        //     email: 'a@a',
        //     password: 'a',
        //     profile: {
        //         firstName: "I am",
        //         lastName: "testUser2",
        //         type: "coach",
        //         clubID: "club1",
        //         teamID: "team1"
        //     }
        // };
        //
        // // Fake user Id's
        // var testUserIds = [];
        //
        // before('attach schemas', function () {
        //     // Attach user schema
        //     Meteor.users.attachSchema(userSchema);
        // });
        //
        // if (Meteor.isServer) {
        //     Meteor.methods({
        //         setupDatabase: () => {
        //             // Reset the database
        //             resetDatabase();
        //
        //             // Add some chat permission to allow database modification
        //             var newPermissions = {
        //                 _id: testUser1.profile.type,
        //                 items: [
        //                     {
        //                         _id: 'Chats',
        //                         permissions: {
        //                             create: true,
        //                             edit: true,
        //                             delete: true,
        //                             view: true
        //                         }
        //                     },
        //                     {
        //                         _id: 'Messages',
        //                         permissions: {
        //                             create: true,
        //                             edit: false,
        //                             delete: true,
        //                             view: true
        //                         }
        //                     }
        //                 ]
        //             };
        //
        //             var adminId = Accounts.createUser(testAdmin);
        //             check(adminId, String);
        //             sinon.stub(Meteor, 'userId').returns(adminId);
        //             var permissionId = Meteor.call('setPermissions', newPermissions);
        //             Meteor.userId.restore();
        //             check(permissionId, String);
        //         }
        //     });
        // }
        //
        // if (Meteor.isClient) {
        //     before(function (done) {
        //         Meteor.call('setupDatabase', done);
        //     });
        //
        //     before('creating fake users', function (done) {
        //         Accounts.createUser(testUser1, function (err) {
        //             if (err) return done(err);
        //             testUserIds.push(Meteor.userId());
        //             Meteor.logout();
        //             Accounts.createUser(testUser2, function (err) {
        //                 if (err) return done(err);
        //                 testUserIds.push(Meteor.userId());
        //                 Meteor.logout();
        //                 done();
        //             });
        //         });
        //     });
        //
        //     // Login and get user data
        //     before('login as coach user', function (done) {
        //         Meteor.loginWithPassword(testUser1.email, testUser1.password, function (err) {
        //             if (err) return done(err);
        //             Meteor.subscribe('userData', done);
        //         });
        //     });
        //
        //     describe('insert()', function () {
        //         it("should insert correctly with correct input", function (done) {
        //             // Login to one of the fake users
        //             var testChat = {users: testUserIds};
        //             try {
        //                 Chats.insert(testChat);
        //                 done();
        //             } catch (err) {
        //                 done(err);
        //             }
        //         });
        //     });
        // }
    });
}