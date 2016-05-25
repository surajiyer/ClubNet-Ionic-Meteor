// import 'angular-mocks';
// import './services';

// describe('Access control', () => {
//     var ac;

//     beforeEach(angular.mock.module('angular-meteor'));
//     beforeEach(angular.mock.module('app.services'));
//     beforeEach(inject(function (_AccessControl_) {
//         ac = _AccessControl_;
//     }));

//     it('should grant coach permission to view voting', function (done) {
//         this.timeout(2000);
//         ac.getPermission("CoachBar", "view", function (result) {
//             expect(result).toBe(true);
//             done();
//         });
//     });
// });