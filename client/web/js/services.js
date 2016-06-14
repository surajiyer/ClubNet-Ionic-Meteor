angular.module('web.services', [])

    .service('checkPassword', function () {
        /**
         * Regular expressions for checking passwords. It should contain at least one alphabetical
         * and numeric character. Furthermore it should have a length of at least 8.
         */
        const passwordRegex = new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{8,})");

        return {
            /**
             * @summary Check whether a password is strong enough
             */
            checkPassword: function (password) {
                return passwordRegex.test(password);
            }
        }
    })