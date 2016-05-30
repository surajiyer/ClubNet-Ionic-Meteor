angular.module('app.config', ['chart.js'])

    .config(function () {
        // If user is logged in, download users data
        Tracker.autorun(function() {
            if(Meteor.userId()) {
                Meteor.subscribe('userData');
            }
        })
    })

    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colours: ['#1976D2', '#1976D2'],
            maintainAspectRatio: false
        });

        ChartJsProvider.setOptions('Line', {
            datasetFill: false
        });

        ChartJsProvider.setOptions('Bar', {});
    }])
