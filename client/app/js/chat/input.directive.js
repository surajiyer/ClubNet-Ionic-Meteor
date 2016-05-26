// import { Directive } from 'angular-ecmascript/module-helpers';
 
// export default class InputDirective extends Directive {
//   constructor() {
//     super(...arguments);
 
//     this.restrict = 'E';
 
//     ds = {
//       'returnClose': '=',
//       'onReturn': '&',
//       'onFocus': '&',
//       'onBlur': '&'
//     };
//   }
//   link(scope, element) {
//     element.bind('focus', function(e) {
//       if (!scope.onFocus) return;
 
//       //this.$timeout(() = &gt; {
//         scope.onFocus();
//       //});
//     });
 
//     element.bind('blur', function(e) {
//       if (!scope.onBlur) return;
 
//       //this.$timeout(() =&gt; {
//         scope.onBlur();
//       //});
//     });
 
//     element.bind('keydown', function(e) {
//       if (e.which != 13) return;
 
//       if (scope.returnClose) {
//         element[0].blur();
//       }
 
//       if (scope.onReturn) {
//       //  this.$timeout(() =&gt; {
//           scope.onReturn();
//       //  });
//       }
//     });
//   }
// }
 
// InputDirective.$name = 'input';
// InputDirective.$inject = ['$timeout'];