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
        'ngTouch'
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
    });
