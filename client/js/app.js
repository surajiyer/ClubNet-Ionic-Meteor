// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'app.services' is found in services.js
// 'app.controllers' is found in controllers.js
angular.module('app', ['angular-meteor',
        'ionic',
        'ngCordova',
        'app.controllers',
        'app.routes',
        'app.services',
        'app.directives'])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    });

function onCordovaReady() {
    angular.bootstrap(document, ['app']);
}

function onWebInterfaceReady() {
    angular.bootstrap(document, ['app']);
}

if (Meteor.isCordova) {
    angular.element(document).on("deviceready", onCordovaReady);
} else {
    angular.element(document).ready(onWebInterfaceReady);
}
