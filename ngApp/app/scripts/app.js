'use strict';

/**
 * @ngdoc overview
 * @name larutadeldinero
 * @description
 * # larutadeldinero
 *
 * Main module of the application.
 */
angular
    .module('larutadeldinero', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        "leaflet-directive"
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/treemap.html',
                controller: 'TreemapCtrl'
            })
            .when('/mapa', {
                templateUrl: 'views/map.html',
                controller: 'MapCtrl'
            })
            .when('/graficos', {
                templateUrl: 'views/charts.html',
                controller: 'ChartsCtrl'
            })
            .when('/tabla', {
                templateUrl: 'views/table.html',
                controller: 'TableCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function($rootScope, $location) {
        $rootScope.location = $location;
    })
    .controller('AppCtrl', function($scope, $rootScope) {

        $scope.filter = {
            year: null,
            type: null,
            district: null,
            party: null
        };

        $scope.years = [2007,2009,2011,2013];

        $scope.$watch('filter.year', function(newValue, oldValue) {
            console.log(oldValue);        //TODO(gb): Remove trace!!!
            var rect = d3.select('#year-' + newValue);
        })
    });
