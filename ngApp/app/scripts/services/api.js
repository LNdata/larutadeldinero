'use strict';

angular.module('larutadeldinero')
    .factory('API', function($http, $rootScope) {
        var baseURL = 'http://origen.larutaelectoral.com.ar/api';

        function filterToQuery(filter) {

            var filters = [],
                q = {
                    'order_by': [
                        { 'field': 'importe', 'direction': 'desc'}
                    ]
                };

            // Año
            if (filter.year) {
                filters.push({
                    'name': 'ciclo',
                    'op': 'eq',
                    'val': filter.year
                })
            }

            // Elecciones
            if (filter.type) {
                filters.push({
                    'name': 'eleccion',
                    'op': 'eq',
                    'val': filter.type
                })
            }

            // Distrito
            if (filter.district) {
                filters.push({
                    'name': 'distrito',
                    'op': 'eq',
                    'val': filter.district
                })
            }

            // Agrupación política
            if (filter.party) {
                filters.push({
                    'name': 'agrupacion_id',
                    'op': 'eq',
                    'val': filter.party.id
                })
            }

            // Aportante name
            if (filter.aportanteName) {
                filters.push({
                    'name': 'aportante',
                    'op': 'has',
                    'val': {
                        'name':'apellido',
                        'op':'like',
                        'val':'%' + filter.aportanteName + '%'
                    }
                })
            }

            // Sexo
            if (filter.sexes) {
                var sexes = [];
                
                for (var sex in filter.sexes) {
                    if (filter.sexes[sex]) sexes.push(sex);
                }
                
                if (sexes.length > 0) {
                    filters.push({
                        'name': 'aportante',
                        'op': 'has',
                        'val': {
                            'name': 'sexo',
                            'op': 'in',
                            'val': sexes
                        }
                    })
                }                
            }

            // Edades
            if (filter.ages) {
                var ages = [];

                for (var age in filter.ages) {
                    if (filter.ages[age]) ages.push(age);
                }

                if (ages.length > 0) {
                    filters.push({
                        'name': 'grupo_edad',
                        'op': 'in',
                        'val': ages
                    })
                }
            }

            // Monto de aporte
            if (filter.amounts) {
                var amounts = [];

                for (var amount in filter.amounts) {
                    if (filter.amounts[amount]) amounts.push('$' + amount);
                }

                if (amounts.length > 0) {
                    filters.push({
                        'name': 'grupo_aporte',
                        'op': 'in',
                        'val': amounts
                    })
                }
            }


            if (filters.length > 0) {
                q.filters= filters;
            }

            return q;
        }

        return {

            treemap: function() {
                return $http.get('/data/treemap_elecciones.json');
            },

            mapdata: function() {
                return $http.get(baseURL + '/map');
            },

            aportantes: function(page) {
                return $http.get(baseURL + '/aportantes' + '?page=' + page);
            },

            aportes: function(page, rpp) {

                var params = ['page=' + page],
                    q = filterToQuery($rootScope.filter);

                if (q) params.push('q=' + JSON.stringify(q));

                return $http.get(baseURL + '/aportes' + '?' + params.join('&'));
            },

            aportanteById: function(idNumber) {
                var q = {
                    'filters': [{
                        'name': 'documento',
                        'op': 'eq',
                        'val': idNumber
                    }]
                };

                return $http.get(baseURL + '/aportantes?q=' + JSON.stringify(q));
            },

            agrupaciones: function () {
                return $http.get(baseURL + '/agrupaciones?results_per_page=200');
            },

            aportesRange: function() {
                var q = {
                    'functions': [{
                        'name': 'max',
                        'field': 'importe'
                    }]
                };

                return $http.get(baseURL + '/eval/aportes?q=' + JSON.stringify(q));
            }

        }
    });