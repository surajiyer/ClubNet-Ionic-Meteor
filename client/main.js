var appContent = "<link rel='stylesheet' href='/app/css/ionic.min.css'/>" +
    "<link rel='stylesheet' href='/app/css/style.css'/>" +
    "<ion-nav-bar class='bar-stable'></ion-nav-bar>" +
    "<ion-nav-view animation='slide-left-right-ios7'></ion-nav-view>";

var webContent = "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css'/>" +
    "<link href='https://fonts.googleapis.com/css?family=Roboto:400,500,700,900' rel='stylesheet' type='text/css'>" +
    "<link rel='stylesheet' href='/web/css/custom.css'/>" +
    "<div id='layout'><div ui-view style='overflow: auto; height: 100vh;'></div></div>";

/**
 * Bootstrap the App module
 */
function loadApp() {
    $("#content").html(appContent);
    angular.bootstrap(document, ['app']);
}

/**
 * Bootstrap the web interface module
 */
function loadWeb() {
    $("#content").html(webContent);
    angular.bootstrap(document, ['web']);
}

if(Meteor.isProduction) {
    if (Meteor.isCordova) {
        angular.element(document).on("deviceready", loadApp);
    } else {
        angular.element(document).ready(loadApp);
    }
} else {
    angular.element(document).ready(loadWeb);
}