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
        'ui.bootstrap'
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
            .when('/aportante/:documento', {
                templateUrl: 'views/aportante.html',
                controller: 'AportanteCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .run(function($rootScope, $location) {
        $rootScope.location = $location;
    })

    .controller('AppCtrl', function($scope, $rootScope) {

        $rootScope.filter = {
            year: null,
            type: null,
            district: null,
            party: null
        };

        $scope.years = [2007,2009,2011,2013];
        $scope.types = ['PRIMARIAS','GENERALES'];
        $scope.districts = [
            'ORDEN NACIONAL',
            'BUENOS AIRES',
            'CAPITAL FEDERAL',
            'CATAMARCA',
            'CHACO',
            'CHUBUT',
            'CORDOBA',
            'CORRIENTES',
            'ENTRE RIOS',
            'FORMOSA',
            'JUJUY',
            'LA PAMPA',
            'LA RIOJA',
            'MENDOZA',
            'MISIONES',
            'NEUQUEN',
            'RIO NEGRO',
            'SALTA',
            'SAN JUAN',
            'SAN LUIS',
            'SANTA CRUZ',
            'SANTA FE',
            'SANTIAGO DEL ESTERO',
            'TIERRA DEL FUEGO',
            'TUCUMAN'
        ];

        $rootScope.$watch('filter.year', refreshData);
        $rootScope.$watch('filter.type', refreshData);
        $rootScope.$watch('filter.district', refreshData);

        function refreshData() {
            setTimeout(function() {
                $rootScope.$emit('filterChanged');
            }, 100)
        }
    })

    .directive('preventClick', function() {
        return function(scope, element, attrs) {
            $(element).click(function(event) {
                event.preventDefault();
            })
        }
    });
