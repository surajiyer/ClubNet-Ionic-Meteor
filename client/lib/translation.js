angular.module('translation', ['pascalprecht.translate'])

    .config(['$translateProvider', 'translations', function ($translateProvider, translations) {

        translations = translations();

        $translateProvider.translations('nl', translations.nl);
        $translateProvider.translations('en', translations.en);
        $translateProvider.preferredLanguage('nl');
    }])

    .constant('translations', function () {
        var translations = {};
        translations.nl = {

            /* MENU */
            MENU_MEMBERS: "Leden",
            MENU_CLUB_SETTINGS: "Clubinstellingen",
            MENU_PROFILE: "Profiel",
            MENU_LOG_OUT: "Uitloggen",
            
            /* GENERAL */
            LOG_IN: "Log in",
            LOG_OUT: "Uitloggen",
            EMAIL: "Email adres",
            PASS: "Wachtwoord",
            FIRST_NAME: "Voornaam",
            LAST_NAME: "Achternaam",
            MEMBER_TYPE: "Gebruikerstype",
            ACTIVATED: "Geactiveerd",
            TEAM: "Team",
            DELETE: "Verwijder",
            EDIT: "Wijzig",
            ADD_MEMBER: "Voeg lid toe",
            NONE: "Geen",
            WELCOME: "Welkom",
            SAVE: "Opslaan",
            SAVED: "Opgeslagen",
            CLUB: "Club",
            CLUB_NAME: "Clubnaam",
            CLUB_LOGO: "Clublogo",
            COLORS: "Kleuren",
            PROFILE: "Profiel",
            CANCEL: "Annuleer",
            SEND: "Verstuur",

            /* PAGE HEADERS */
            MEMBERS_TITLE: "Leden",
            MEMBERS_SUBTITLE: "Voeg leden van je club toe aan ClubNet, wijzig informatie van leden of verwijder ze.",
            ADD_MEMBER_TITLE: "Voeg lid toe",
            ADD_MEMBER_SUBTITLE: "Voeg een clublid toe aan het ClubNet systeem.",
            ADD_MEMBER_TYPE_TOOLTIP: "Het lid zal het gebruikerstype speler hebben als het gekoppeld is aan een team. Zo niet, zal het lid het gebruikerstype algemeen hebben.",
            EDIT_MEMBER_TITLE: "Wijzig lid",
            EDIT_MEMBER_SUBTITLE: "Wijzig een clublid in het ClubNet systeem.",
            PROFILE_TITLE: "Profiel",
            PROFILE_SUBTITLE: "Verander je gebruiksgegevens.",
            CLUB_SETTINGS_TITLE: "Clubinstellingen",
            CLUB_SETTINGS_SUBTITLE: "Verander instellingen voor de gehele club",
            DELETE_TITLE: "Weet je het zeker?",
            DELETE_MESSAGE: "Weet je zeker dat je de deze gebruiker wilt verwijderen: ",
            FORGOT_PASS_TITLE: "Wachtwoord vergeten?",
            FORGOT_PASS_MESSAGE: "Wachtwoord vergeten? Als je hieronder je e-mail adres invult zullen we je een link sturen om je wachtwoord opnieuw in te stellen.",
            
            /* OTHER */
            USER_PROFILE: "Gebruikersprofiel",
            UPDATE_PROFILE_SUCCESS: "Gebruikersprofiel aangepast",
            CHANGE_PASS: "Verander wachtwoord",
            CURRENT_PASS: "Huidig wachtwoord",
            NEW_PASS: "Nieuw wachtwoord",
            CONFIRM_PASS: "Bevestig wachtwoord",
            CHANGE_PASS_SUCCESS: "Wachtwoord aangepast",
            ADD_USER: "Voeg gebruiker toe",
            FORGOT_PASS: "Wachtwoord vergeten",
            INCORRECT_CREDENTIALS: "De gegevens zijn onjuist",
            MISSING_FIRST_NAME: "Geen voornaam ingevuld",
            MISSING_LAST_NAME: "Geen achternaam ingevuld",
            MISSING_VALID_EMAIL: "Geen geldig email adres ingevuld",
            MISSING_CURRENT_PASS: "Huidige wachtwoord niet ingevuld",
            MISSING_NEW_PASS: "Geen nieuw wachtwoord ingevuld",
            MISSING_CONFIRM_PASS: "Geen bevestiging van wachtwoord ingevuld",
            PASS_NO_MATCH: "Nieuwe wachtwoorden komen niet overeen",
            PASS_NOT_VALID: "Nieuwe wachtwoord niet sterk genoeg. Het wachtwoord moet minstens acht tekens bevatten waarvan tenminste één letter en één cijfer",
            "Match failed": "Ongeldige combinatie"
        };
        translations.en = {
            MEMBERS_SUBTITLE: "Add, delete and manage the members of your club."
        };

        return translations;
    })	