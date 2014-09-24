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
        "leaflet-directive",
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

    .controller('AppCtrl', function($scope, $rootScope, API) {

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
        API.agrupaciones().then(function(response) {
            $rootScope.parties = response.data.objects;
        });

        // Elementos del filtro avanzado
        $scope.sexes = [
            { name: 'Hombres', val: 'M' },
            { name: 'Mujeres', val: 'F' }
        ];
        $scope.ages = [
            { name: 'Menos de 30', val: 'menos de 30' },
            { name: 'Entre 30 y 39', val: '30-39' },
            { name: 'Entre 40 y 49', val: '40-49' },
            { name: 'Entre 50 y 59', val: '50-59' },
            { name: 'Entre 60 y 69', val: '60-69' },
            { name: 'Más de 70', val: '70 y más' }
        ];
        $scope.amounts = [
            { name: 'Menos de $500', val: '1 - $499 \n' },
            { name: 'Entre $500 y $1.999', val: '500 - $1.999 \n' },
            { name: 'Entre $2.000 y $4.999', val: '2.000 - $4.999 \n' },
            { name: 'Entre $5.000 y $9.999', val: '5.000 - $9.999 \n' },
            { name: 'Entre $10.000 y $49.999', val: '10.000 - $49.999 \n' },
            { name: 'Más de $50.000', val: '50.000 y más \n' }
        ];

        $rootScope.$watch('filter.year', refreshData);
        $rootScope.$watch('filter.type', refreshData);
        $rootScope.$watch('filter.district', refreshData);
        $rootScope.$watch('filter.party', refreshData);
        $rootScope.$watch('filter.sexes', refreshData, true);
        $rootScope.$watch('filter.ages', refreshData, true);
        $rootScope.$watch('filter.amounts', refreshData, true);

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
