angular.module('web.services', [])

    .service('checkPassword', function ($meteor) {
        /**
         * @summary Check whether a password is strong enough
         */
        return {
            checkPassword: function (password) {
                /**
                 * Regular expressions for checking passwords. It should contain at least one alphabetical
                 * and numeric character. Furthermore it should have a length of at least 8.
                 */
                var passwordRegex = new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{8,})");
                
                return passwordRegex.test(password);
            }
        }
    })