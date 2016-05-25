// import { Directive } from 'angular-ecmascript/module-helpers';
 
// export default class InputDirective extends Directive {
//   constructor() {
//     super(...arguments);
 
//     this.restrict = 'E';
 
//     this.scope = {
//       'returnClose': '=',
//       'onReturn': '&',
//       'onFocus': '&',
//       'onBlur': '&'
//     };
//   }
 
//   link(scope, element) {
//     element.bind('focus', (e) =&gt; {
//       if (!scope.onFocus) return;
 
//       this.$timeout(() =&gt; {
//         scope.onFocus();
//       });
//     });
 
//     element.bind('blur', (e) =&gt; {
//       if (!scope.onBlur) return;
 
//       this.$timeout(() =&gt; {
//         scope.onBlur();
//       });
//     });
 
//     element.bind('keydown', (e) =&gt; {
//       if (e.which != 13) return;
 
//       if (scope.returnClose) {
//         element[0].blur();
//       }
 
//       if (scope.onReturn) {
//         this.$timeout(() =&gt; {
//           scope.onReturn();
//         });
//       }
//     });
//   }
// }
 
// InputDirective.$name = 'input';
// InputDirective.$inject = ['$timeout'];