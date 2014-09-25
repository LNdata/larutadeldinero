'use strict';

angular.module('larutadeldinero')
    .factory('Aportantes', function($http, $rootScope) {
        var baseURL = 'http://api.larutaelectoral.com.ar/api';

        function filterToQuery(filter, query) {
            var q = { filters: [] };
            angular.extend(q, query);

            // Sexo
            if (filter.sexes) {
                var sexes = [];

                for (var sex in filter.sexes) {
                    if (filter.sexes[sex]) sexes.push(sex);
                }

                if (sexes.length > 0) {
                    q.filters.push({
                        'name': 'sexo',
                        'op': 'in',
                        'val': sexes
                    })
                }
            }

            // Año
            if (filter.year) {
                q.filters.push({
                    'name': 'ciclo',
                    'op': 'eq',
                    'val': filter.year
                })
            }

            // Elecciones
            if (filter.type) {
                q.filters.push({
                    'name': 'eleccion',
                    'op': 'eq',
                    'val': filter.type
                })
            }

            // Distrito
            if (filter.district) {
                q.filters.push({
                    'name': 'distrito',
                    'op': 'eq',
                    'val': filter.district
                })
            }

            // Agrupación política
            if (filter.party) {
                q.filters.push({
                    'name': 'agrupacion_id',
                    'op': 'eq',
                    'val': filter.party.id
                })
            }

            return q;
        }

        return {
            find: function(page) {
                return $http.get(baseURL + '/aportantes' + '?page=' + page);
            },

            findById: function(idNumber) {
                var q = {
                    'filters': [{
                        'name': 'documento',
                        'op': 'eq',
                        'val': idNumber
                    }]
                };

                return $http.get(baseURL + '/aportantes?q=' + JSON.stringify(q));
            },

            forMap: function() {
                var params = [],
                    baseQuery = {
                        filters: [
                            {'name': 'lat', 'op': 'neq', 'val': ''},
                            {'name': 'lon', 'op': 'neq', 'val': ''}
                        ]
                    },
                    q = filterToQuery($rootScope.filter, baseQuery);

                if (q) params.push('q=' + JSON.stringify(q) + '?' + params.join('&'));

                return $http.get(baseURL + '/map');
            }
        }
    })

    .factory('Aportes', function($http, $rootScope) {
        var baseURL = 'http://api.larutaelectoral.com.ar/api';

        function filterToQuery(filter, order_by, initialFilters) {

            var filters = [],
                q = null;

            if (initialFilters)
                filters = filters.concat(initialFilters);

            if (order_by) {
                q = { 'order_by': order_by };
            }

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
                if (!q) q = {};
                q.filters= filters;
            }

            return q;
        }

        return {

            forTreemap: function() {
                return $http.get('/data/treemap_elecciones.json');
            },

            find: function(page, rpp) {
                var params = ['page=' + page],
                    order_by = [{ 'field': 'importe', 'direction': 'desc'}],
                    q = filterToQuery($rootScope.filter, order_by);

                if (q) params.push('q=' + JSON.stringify(q));

                return $http.get(baseURL + '/aportes' + '?' + params.join('&'));
            },

            bySex: function() {
                var params = [],
                    q = filterToQuery($rootScope.filter);

                if (q) params.push('q=' + JSON.stringify(q));

                return $http.get(baseURL + '/aportes/edad' + '?' + params.join('&'));
            },

            byAge: function() {
                var params = [],
                    q = filterToQuery($rootScope.filter);

                if (q) params.push('q=' + JSON.stringify(q));

                return $http.get(baseURL + '/aportes/sexo' + '?' + params.join('&'));
            },

            aportantesBySex: function() {
                var params = [],
                    q = filterToQuery($rootScope.filter);

                if (q) params.push('q=' + JSON.stringify(q));

                return $http.get(baseURL + '/aportantes/sexo' + '?' + params.join('&'));
            },

            aportantesByAge: function() {
                var params = [],
                    q = filterToQuery($rootScope.filter);

                if (q) params.push('q=' + JSON.stringify(q));

                return $http.get(baseURL + '/aportantes/edad' + '?' + params.join('&'));
            }
        }
    })

    .factory('Agrupaciones', function($http, $rootScope) {
        var baseURL = 'http://api.larutaelectoral.com.ar/api';

        return {
            findAll: function () {
                return $http.get(baseURL + '/agrupaciones?results_per_page=200');
            }
        }
    })