// import {assert} from 'meteor/practicalmeteor:chai';
// import {sinon} from 'meteor/practicalmeteor:sinon';
// import {Meteor} from 'meteor/meteor';
//
// import {chats, messages} from '/imports/schemas/chats';
// import './Chats.js';
// import './ItemTypes.js';
//
// let testControl;
// let testPr;
// if(Meteor.isClient) {
//     describe('Chat allows', () => {
//         console.log('beginning describe');
//         // Add schema to Items
//         Chats.attachSchema(chats);
//         Messages.attachSchema(messages);
//         //
//
//         it("Add Permissions", (done) => {
//             Meteor.userId = sinon.stub().returns('1');
//             Meteor.user = sinon.stub().returns('1');
//             global.Meteor.userId = sinon.stub().returns('1');
//
//             var toInsert  = {
//                 users: ['1', '2'],
//                 status: "open",
//                 lastMessage:  "Hi"
//             };
//             console.log('beginning test');
//             try {
//                 Chats.insert(toInsert);
//                 done();
//             } catch(err) {
//                 console.log("error: "+ err);
//             }
//
//         });
//
//     });
// }