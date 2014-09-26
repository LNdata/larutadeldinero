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
        'ui.bootstrap',
		'angular.filter'
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

    .controller('AppCtrl', function($scope, $rootScope, Agrupaciones) {

        $rootScope.filter = {
            year: null,
            type: null,
            district: null,
            party: null,
            sexes: {},
            ages: {},
            amounts: {}
        };

        $scope.advancedFilterCollapsed = false;

        // Elementos del filtro
        $scope.years = [2007,2009,2011,2013];
        $scope.types = ['PRIMARIAS','GENERALES'];
        $scope.districts = ['ORDEN NACIONAL','BUENOS AIRES','CAPITAL FEDERAL','CATAMARCA','CHACO','CHUBUT','CORDOBA','CORRIENTES','ENTRE RIOS','FORMOSA','JUJUY','LA PAMPA','LA RIOJA','MENDOZA','MISIONES','NEUQUEN','RIO NEGRO','SALTA','SAN JUAN','SAN LUIS','SANTA CRUZ','SANTA FE','SANTIAGO DEL ESTERO','TIERRA DEL FUEGO','TUCUMAN'];
        Agrupaciones.findAll().then(function(response) {
            $rootScope.parties = response.data.objects;
        });

        // Elementos del filtro avanzado
        $scope.sexes = [
            { name: 'M', val: 'M' },
            { name: 'F', val: 'F' }
        ];
        $scope.ages = [
            { name: '< 30', val: 'menos de 30' },
            { name: '30-39', val: '30-39' },
            { name: '40-49', val: '40-49' },
            { name: '50-59', val: '50-59' },
            { name: '60-69', val: '60-69' },
            { name: '>= 70', val: '70 y más' }
        ];
        $scope.amounts = [
            { name: '  < $500', val: '1 - $499 \n' },
            { name: '    $500 -  $1.999', val: '500 - $1.999 \n' },
            { name: '  $2.000 -  $4.999', val: '2.000 - $4.999 \n' },
            { name: '  $5.000 -  $9.999', val: '5.000 - $9.999 \n' },
            { name: ' $10.000 - $49.999', val: '10.000 - $49.999 \n' },
            { name: '>$50.000', val: '50.000 y más \n' }
        ];

        setTimeout(function() {
            $rootScope.$watch('filter', refreshData, true);
        }, 1000);


        function refreshData() {
            setTimeout(function() {
                $rootScope.$emit('filterChanged');
            }, 100)
        }

        $scope.hasAnyTrueValues = function(obj) {
            for (var val in obj) {
                if (obj[val]) return true;
            }
            return false;
        }
    })

    .directive('preventClick', function() {
        return function(scope, element, attrs) {
            $(element).click(function(event) {
                event.preventDefault();
            })
        }
    })

    .filter('agrupacionName', function($rootScope) {
        return function(agrupacionId) {
            var filtered = $rootScope.parties.filter(function (agrupacion) {
                return agrupacion.id == agrupacionId
            });

            return filtered.length > 0 ? filtered[0].nombre : '-';
        }
    })
