// import { Meteor } from 'meteor/meteor';
// import { Random } from 'meteor/random';
// import { assert } from 'meteor/practicalmeteor:chai';

// import './ItemTypes.js';

// if (Meteor.isServer) {
//     describe('TypesCollection', () => {
//         describe('methods', () => {
//             let taskId;

//             beforeEach(() => {
//                 // TypesCollection.remove({});
//                 // taskId = TypesCollection.insert({
//                 //     text: 'test task'
//                 // });
//                 TypesCollection.deny({
//                     insert: function () {
//                         return true;
//                     },
//                     update: function () {
//                         return true;
//                     },
//                     remove: function () {
//                         return true;
//                     }
//                 });
//                 TypesCollection.remove({});
//                 taskId = TypesCollection.insert({
//                     text: 'test task'
//                 });
//             });

//             it('can find inserted type', () => {
//                 console.log(TypesCollection.find().fetch());
//                 assert.equal(TypesCollection.find().count(), 1);
//             });
//         });
//     });
// }