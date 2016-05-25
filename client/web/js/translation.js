angular.module('web.translation', ['pascalprecht.translate'])

    .config(['$translateProvider', 'translations', function ($translateProvider, translations) {

        translations = translations();

        $translateProvider.translations('nl', translations.nl);
        $translateProvider.translations('en', translations.en);
        $translateProvider.preferredLanguage('en');
    }])

    .constant('translations', function () {
        var translations = {};
        translations.nl = {
            "Sign in": "Log in",
            "Email address": "Email adres",
            "Password": "Wachtwoord",
            "Signed in": "Aangemeld",
            "Log out": "Uitloggen",
            "First name": "Voornaam",
            "Last name": "Achternaam",
            "Members": "Leden",
            "Add user": "Voeg gebruiker toe",
            "Player": "Speler",
            "Coach": "Trainer",
            "Public Relations manager": "Public Relations manager",
            "Feed": "Feed",
            "Profile": "Profiel",
            "Club betting": "Clubpoule",
            "Club settings": "Clubinstellingen",
            "Forgot password": "Wachtwoord vergeten"
            
        };
        translations.en = {
        };

        return translations;
    })	