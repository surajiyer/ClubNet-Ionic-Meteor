angular.module('web.translation', ['pascalprecht.translate'])

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

            /* PAGE HEADERS */
            MEMBERS_TITLE: "Leden",
            MEMBERS_SUBTITLE: "Voeg leden van je club toe aan ClubNet, wijzig informatie van leden of verwijder ze.",
            ADD_MEMBER_TITLE: "Voeg lid toe",
            ADD_MEMBER_SUBTITLE: "Voeg een clublid toe aan het ClubNet systeem.",
            ADD_MEMBER_TYPE_TOOLTIP: "Het lid zal het gebruikerstype speler hebben als het gekoppeld is aan een team. Zo niet, zal het lid het gebruikerstype algemeen hebben.",
            PROFILE_TITLE: "Profiel",
            PROFILE_SUBTITLE: "Verander je gebruiksgegevens.",
            CLUB_SETTINGS_TITLE: "Clubinstellingen",
            CLUB_SETTINGS_SUBTITLE: "Change club colors and modify feed settings.",

            
            
            
            
            
            
            
            USER_PROFILE: "Gebruikersprofiel",
            UPDATE_PROFILE_SUCCESS: "Gebruikersprofiel aangepast",
            
            CHANGE_PASS: "Verander wachtwoord",
            CURRENT_PASS: "Huidig wachtwoord",
            NEW_PASS: "Nieuw wachtwoord",
            CONFIRM_PASS: "Bevestig wachtwoord",
            CHANGE_PASS_SUCCESS: "Wachtwoord aangepast",
            
            
            



            "Profile": "Profiel",
            "User profile": "Gebruikersprofiel",
            "Change password": "Verander wachtwoord",
            "Successfully updated profile": "Gebruikersprofiel aangepast",
            "Successfully updated password": "Wachtwoord veranderd",
            "Current password": "Huidige wachtwoord",
            "New password": "Nieuwe wachtwoord",
            "Confirm new password": "Bevestig nieuwe wachtwoord",
            "Change your personal user settings.": "Verander je gebruikersgegevens.",
            "The member will be of the type player if a team is selected, otherwise they will be of type general.": "",
            ADD_USER: "Voeg gebruiker toe",
            "Add a club member to the ClubNet system.": "",
            "Edit user": "Wijzig gebruiker",
            "Edit a club member of the ClubNet system.": "Wijzig een clublid in het ClubNet systeem.",
            "Save changes": "Opslaan",
            "Player": "Speler",
            "Coach": "Trainer",
            "None": "Geen",
            "Public Relations manager": "Public Relations manager",
            "Feed": "Feed",
            "Club betting": "Clubpoule",
            "Club settings": "Clubinstellingen",
            FORGOT_PASS: "Wachtwoord vergeten",
            "Update password": "Opslaan",
            "Update profile": "Opslaan",
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