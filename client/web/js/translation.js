angular.module('web.translation', ['pascalprecht.translate'])

.config(['$translateProvider', 'translations', function($translateProvider, translations) {

  translations = translations();

  $translateProvider.translations('nl', translations.nl);
  $translateProvider.translations('en', translations.en);
  $translateProvider.preferredLanguage('en');
}])

.constant('translations', function() {
  var translations = {};
  translations.nl = {
    "Sign in":"Log in",
    "Email address":"Email adres",
    "Password":"Wachtwoord",
    "Signed in":"Aangemeld",
    "Log out":"Uitloggen"
  };
  translations.en = {
    "Sign in":"Sign in",
    "Email address":"Email address",
    "Password":"Password"
  };
  return translations;
})	