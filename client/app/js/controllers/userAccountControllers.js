import { Template } from 'meteor/templating';
angular.module('userAccountControllers', [])
    /**
     *  Register Controller: provides all functionality for the register screen of the app
     */
    .controller('registerCtrl', function ($scope, $meteor, $state) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };
        /**
         * @summary Function to register a new user
         */
        $scope.register = function () {
            if (!$scope.user.email)
                throw new Meteor.Error('Account registration error: e-mail is not valid');
            var newUser = {
                email: $scope.user.email,
                password: $scope.user.password,
                profile: {
                    firstName: "p",
                    lastName: "1",
                    type: "player",
                    clubID: "club",
                    teamID: "team1"
                }
            };
            Meteor.call('addUser', newUser, function (err, result) {
                if (err || !Match.test(result, String))
                    throw new Meteor.Error('Account registration error: ' + err.reason);
                Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                    if (error) throw new Meteor.Error(error.reason);
                    $state.go('menu.feed'); // Redirect user if registration succeeds
                });
            });
        };
    })

    /**
     *  Login Controller: provides all functionality for the login screen of the app
     */
    .controller('loginCtrl', function ($scope, $meteor, $state) {
        /**
         * Credentials of the user
         */
        $scope.user = {
            email: '',
            password: ''
        };
        /**
         * @summary Function for a user to login
         */
        $scope.login = function () {
            Meteor.loginWithPassword($scope.user.email, $scope.user.password, function (error) {
                if (error) {
                    throw new Meteor.Error(error.reason);
                }
                $state.go('menu.feed');
            });
        };

        /**
         * @summary Function to show the forgot password page
         */
        $scope.goToRemindPassword = function () {
            $state.go('forgotPassword');
        }
        
        // $scope.goToResetPassword = function () {
        //     $state.go("resetpassword");
        // }
        
        // $scope.goToEnroll = function () {
        //     $state.go("enroll");
        // }
    })

    /**
     *  Forgot Password Controller: provides all functionality for the forgot password screen of the app
     */
    .controller('forgotPasswordCtrl', function ($scope, $state) {
        /**
         * Information of the user who forgot his password
         */
        $scope.forgotUser = {
            email: '',
        };

         /**
         * @summary Function to send email to user to reset password
         */
        $scope.forgotPassword = function () {          
            var mailRegularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            if (!mailRegularExpression.test($scope.forgotUser.email)) {
                //show error message
                console.log("That is not a valid email address");
            } else {
                Accounts.forgotPassword({email: $scope.forgotUser.email});
                console.log("Email sent");
                $state.go('login');
            }
                    
            // var emailData = {
            //     message: "Reset your ClubNet password by clicking",
            //     url: "clubnet://",
            //     title: "here"
            // };
            
            //var html = Blaze.toHTML(Blaze.With(emailData, function() {return Template.foo;}));
            //var html = Blaze.toHTMLWithData(Template.myTemplate, emailData);
            //var test = Blaze.isTemplate(Template.myTemplate);
            //console.log(test);
            // var options = {
            //     from: '"Clubnet" <clubnet.noreply@gmail.com>',
            //     to: $scope.forgotUser.email,
            //     subject: "Reset your ClubNet password",
            //     //todo: create beautiful template
            //     html:'<a href="clubnet://">Click here to reset your password</a>'
            // }
            // Meteor.call("sendShareEmail", options);
        };
    })
    
    /**
     *  Reset Password Controller: provides all functionality for the reset password screen of the app
     */
    .controller('resetPasswordCtrl', function ($scope, $meteor, $state, $stateParams, checkPassword) {
        /**
         * Information of the user who forgot his password
         */
        $scope.forgotUser = {
            email: '',
            token: '',
            newPassword: '',
            confirmNewPassword: ''
        };

        /**
         * @summary Function to reset the users password
         */
        $scope.resetPassword = function () {
            if (!$scope.forgotUser.newPassword) {
                console.log('No new password specified');               
            } else if (!$scope.forgotUser.confirmNewPassword) {
                console.log('Please confirm your new password');                
            } else if ($scope.forgotUser.newPassword != $scope.forgotUser.confirmNewPassword) {
                console.log('New passwords do not match');
            } else if (!checkPassword.checkPassword($scope.forgotUser.newPassword)) {
                console.log('Password not strong enough. It should contain at least 8 characters of which at least one alphabetical and one numeric.');
            } else {
                $meteor.resetPassword($stateParams.token, $scope.forgotUser.newPassword)
            };
        }
        $state.go('login');
    })
    
    /**
     *  Profile Controller: provides all functionality for the Profile screen of the app
     */
    .controller('profileCtrl', function ($scope, $meteor, $state) {
        /**
         * Profile information
         */
        $scope.temp_user = {
            email: '',
            firstName: '',
            lastName: ''
        };

        /**
         * Password information
         */
        $scope.temp_pass = {
            oldPass: '',
            newPass: '',
            newPassCheck: ''
        };

        /**
         * @summary Function to change the profile information
         */
        $scope.changeGeneralProfileInfo = function () {
            var email = $scope.temp_user.email;
        };

        /**
         * @summary Function to change the password
         */
        $scope.changePassword = function () {
            if ($scope.temp_pass.newPass == $scope.temp_pass.newPassCheck) {
                $meteor.changePassword($scope.temp_pass.oldPass, $scope.temp_pass.newPass).then(function () {
                    console.log('Change password success');
                    $state.go('menu.feed');
                }, function (error) {
                    $scope.error = error.reason;
                    $scope.errorVisible = {'visibility': 'visible'};
                    console.log('Error changing password - ', error);
                });
            } else {
                $scope.error = "The passwords don't match.";
            }
        };

        /**
         * Data for error message
         */
        $scope.error = '';
        $scope.errorVisible = {'visibility': 'hidden'};
    })