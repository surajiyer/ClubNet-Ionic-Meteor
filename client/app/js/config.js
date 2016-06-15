angular.module('app.config', ['chart.js'])

    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colours: ['#1976D2', '#1976D2'],
            maintainAspectRatio: true
        });

        ChartJsProvider.setOptions('Line', {
            datasetFill: false
        });

        ChartJsProvider.setOptions('Bar', {});
    }])

    .filter('capitalize', function() {
        return function(token) {
            return token.charAt(0).toUpperCase() + token.slice(1);
        }
    });
