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

            /* WEB MENU */
            MENU_MEMBERS: "Leden",
            MENU_CLUB_SETTINGS: "Clubinstellingen",
            MENU_PROFILE: "Profiel",
            MENU_LOG_OUT: "Uitloggen",
            MENU_FEED: "Feed",
            MENU_CHAT: "Berichten",
            MENU_SETTINGS: "Instellingen",

            /* ITEM TYPES*/
            FORM: "Inventarisatie",
            HEROES: "Helden",
            POLLS: "Oefening kiezen",
            SPONSORING: "Sponsorevenement",
            CLOSED: "(gesloten)",
            READ_MORE: "Lees meer",
            READ_LESS: "Lees minder",

            /* GENERAL */
            LOG_IN: "Log in",
            SUCCESS: "Gelukt!",
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
            SETTINGS: "Instellingen",
            STICKY: "Plak bovenaan vast",
            STICKY_UNDO: "Losmaken",
            HOME: "Home",
            CLOSE: "Sluiten",
            OPEN: "Openen",
            SELECT: "Selecteer",
            OTHER: "Anders",
            DAILY: "Dagelijks",
            WEEKLY: "Wekelijks",
            MONTHLY: "Maandelijks",
            TITLE: "Titel",
            DESCRIPTION: "Beschrijving",
            PUBLISH: "Publiceer",
            DEADLINE: "Deadline",

            /* NOTIFCATION */
            NOTIFICATION_VOTING_TEXT: "Vote for the exercise you like.",
            NOTIFICATION_VOTING_TITLE: "New voting!",
            NOTIFICATION_HEROES_TEXT: "Check out a new hero of the week.",
            NOTIFICATION_HEROES_TITLE: "New Hero!",
            NOTIFICATION_FORM_TEXT: "React on new practicality.",
            NOTIFICATION_FORM_TITLE: "New practicality!",
            NOTIFICATION_SPONSORING_TITLE: "New sponsoring event!",
            NOTIFICATION_SPONSORING_TEXT: "Contribute to a new sponsoring event",

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

            /* PRACTICALITY FORM */
            NEW_PRACTICALITY: "Nieuwe inventarisatie",
            SELECT_TYPE: "Selecteer een type",
            LAUNDRY: "Was",
            DRIVING: "Vervoer",
            ABSENCE: "Absentie",
            REPEAT_INTERVAL: "Herhaalfrequentie",
            TARGET: "Doel (aantal)",
            TARGET_REACHED: "We hebben voldoende mensen.",
            NUMBER_PRESENT: "Aantal aanwezigen",
            STILL_NEED: "Nog nodig",
            CONTRIBUTION: "Contributie",
            ABSENT: "Absent",
            CONTRIBUTE: "Meld aan",
            BUTTON_PRESENT: "Aanwezig",
            BUTTON_WITHDRAW: "Trek terug",
            MISSING_TARGET_VALUE: "Geel doel ingevuld",
            
            /* CHAT */
            CHAT_TITLE: "Gesprekken",
            NEW_CHAT: "Nieuw gesprek",
            
            /* HERO FORM */
            NEW_HERO: "Nieuwe held",
            SELECT_PICTURE: "Kies foto",
            SELECTED_PICTURE: "De geselecteerde foto",

            /* SPONSORING */
            NEW_SPONSORING: "Nieuw sponsorevenement",
            
            /* EXERCISE VOTING */
            NEW_VOTING: "Nieuwe stem voor oefening",
            SELECT_TRAINING: "Selecteer een training",
            SHOW_INT_RESULTS_MESSAGE: "Laat de tussentijdse resultaten zien",
            SHOW_FINAL_RESULTS_MESSAGE: "Laat de resultaten zien na afloop",
            
            /* OTHER */
            ERROR: "Foutmelding",
            ENROLL: "Aanmelden",
            ENROLL_PASS: "Vul hieronder je gewenste wachtwoord in",
            NO_ITEMS_MESSAGE: "Geen feed items gevonden",
            DUTCH: "Nederlands",
            ENGLISH: "Engels",
            SELECT_LANG: "Kies taal",
            USER_PROFILE: "Gebruikersprofiel",
            UPDATE_PROFILE_SUCCESS: "Gebruikersprofiel aangepast",
            UPDATE_CLUB_SUCCESS: "Club aangepast",
            CHANGE_PASS: "Verander wachtwoord",
            CURRENT_PASS: "Huidig wachtwoord",
            NEW_PASS: "Nieuw wachtwoord",
            CONFIRM_PASS: "Bevestig wachtwoord",
            CONFIRM_VOTE: "Bevestig stem",
            CHANGE_PASS_SUCCESS: "Wachtwoord aangepast",
            ADD_USER: "Voeg gebruiker toe",
            FORGOT_PASS: "Wachtwoord vergeten",
            RESET_PASS: "Nieuw wachtwoord instellen",
            RESET_PASS_MESSAGE: "Vul hieronder je nieuwe wachtwoord in",
            INCORRECT_CREDENTIALS: "De gegevens zijn onjuist",
            NOT_AUTHORIZED: "Geen toegang, U bent niet geauthoriseerd",
            MISSING_CLUB_NAME: "Geen clubnaam ingevuld",
            MISSING_FIRST_NAME: "Geen voornaam ingevuld",
            MISSING_PASSWORD: "Vul a.u.b een geldig wachtwoord in",
            MISSING_LAST_NAME: "Geen achternaam ingevuld",
            MISSING_VALID_EMAIL: "Geen geldig email adres ingevuld",
            MISSING_VALID_EMAIL_MESSAGE: "Vul a.u.b een geldig email adres in",
            MISSING_CURRENT_PASS: "Huidige wachtwoord niet ingevuld",
            MISSING_NEW_PASS: "Geen nieuw wachtwoord ingevuld",
            MISSING_CONFIRM_PASS: "Geen bevestiging van wachtwoord ingevuld",
            CONFIRM_DELETE: "Weet je zeker dat je het item wil verwijderen?",
            PASS_NO_MATCH: "Nieuwe wachtwoorden komen niet overeen",
            PASS_RESET_SUCCESS: "Uw wachtwoord is succesvol veranderd, log a.u.b. opnieuw in.",
            EMAILSENDFORPASSRESET: "Er is een mail naar u verstuurt om het wachtwoord te veranderen.",
            PASS_NOT_VALID: "Nieuwe wachtwoord niet sterk genoeg. Het wachtwoord moet minstens acht tekens bevatten waarvan tenminste één letter en één cijfer",
            "Match failed": "Ongeldige combinatie",
            "Token expired": "Link verlopen",
            PASSWORD_RECOVERY_SENT: "Mail verzonden naar",
            PASS_INCORRECT: "Wachtwoord niet correct",
            EMAIL_IN_USE: "Email adres is reeds in gebruik door een lid",
            CREATE_NEW: "Nieuw item aanmaken",
            FILTER_ON: "Filteren op"
        };
        translations.en = {
            MEMBERS_SUBTITLE: "Add, delete and manage the members of your club."
        };

        return translations;
    });