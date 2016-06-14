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
            "Sign in": "Log in",
            "Email address": "Email adres",
            "Password": "Wachtwoord",
            "Signed in": "Aangemeld",
            "Log out": "Uitloggen",
            "First name": "Voornaam",
            "Last name": "Achternaam",
            "Members": "Leden",
            "Member type": "Gebruikerstype",
            "Profile": "Profiel",
            "User profile": "Gebruikersprofiel",
            "Change password": "Verander wachtwoord",
            "Successfully updated profile": "Gebruikersprofiel aangepast",
            "Successfully updated password": "Wachtwoord veranderd",
            "Current password": "Huidige wachtwoord",
            "New password": "Nieuwe wachtwoord",
            "Confirm new password": "Bevestig nieuwe wachtwoord",
            "Change your personal user settings.": "Verander je gebruikersgegevens.",
            "Activated": "Geactiveerd",
            "Add, delete and manage the members of your club.": "Voeg leden van je club toe aan ClubNet, wijzig informatie van leden of verwijder ze.",
            "The member will be of the type player if a team is selected, otherwise they will be of type general.": "Het lid zal het gebruikerstype speler hebben als het gekoppeld is aan een team. Zo niet, zal het lid het gebruikerstype general hebben.",
            "Add user": "Voeg gebruiker toe",
            "Add a club member to the ClubNet system.": "Voeg een clublid toe aan het ClubNet systeem",
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
            "Forgot password": "Wachtwoord vergeten",
            "Update password": "Opslaan",
            "Update profile": "Opslaan",
            "Incorrect credentials": "De gegevens zijn onjuist",
            "No first name specified": "Geen voornaam ingevuld",
            "No last name specified": "Geen achternaam ingevuld",
            "No valid email specified": "Geen geldig email adres ingevuld",
            "Match failed": "Ongeldige combinatie",
            "Current password not specified": "Huidige wachtwoord niet ingevuld",
            "No new password specified": "Geen nieuw wachtwoord ingevuld",
            "Please confirm your new password": "Geen bevestiging van wachtwoord ingevuld",
            "New passwords do not match": "Nieuwe wachtwoorden komen niet overeen",
            "Password not strong enough. It should contain at least 8 characters of which at least one alphabetical and one numeric": "Nieuwe wachtwoord niet sterk genoeg. Het wachtwoord moet minstens acht tekens bevatten waarvan tenminste één letter en één cijfer",
            
            
            
        };
        translations.en = {
        };

        return translations;
    })	