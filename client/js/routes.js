angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider.state('menu.polls', {
    url: '/polls',
    views: {
      'side-menu21': {
        templateUrl: 'client/views/polls.ng.html',
        controller: 'pollsCtrl'
      }
    }
  })

  .state('menu.practicalities', {
    url: '/practicalities',
    views: {
      'side-menu21': {
        templateUrl: 'client/views/practicalities.ng.html',
        controller: 'practicalitiesCtrl'
      }
    }
  })

  .state('menu.feed', {
    url: '/feed',
    views: {
      'side-menu21': {
        templateUrl: 'client/views/feed.ng.html',
        controller: 'feedCtrl'
      }
    }
  })

  .state('menu.sponsoring', {
    url: '/sponsoring',
    views: {
      'side-menu21': {
        templateUrl: 'client/views/sponsoring.ng.html',
        controller: 'sponsoringCtrl'
      }
    }
  })

  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'client/views/menu.ng.html',
    abstract:true
  })

  .state('menu.settings', {
    url: '/settings',
    views: {
      'side-menu21': {
        templateUrl: 'client/views/settings.ng.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('login', {
    url: '/page5',
    templateUrl: 'client/views/login.ng.html',
    controller: 'loginCtrl'
  })

  $urlRouterProvider.otherwise('/page5')
});