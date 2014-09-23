'use strict';

angular.module('larutadeldinero')
    .factory('API', function($http, $rootScope) {
        var baseURL = 'http://origen.larutaelectoral.com.ar/api';

        function filterToQuery(filter) {

            var filters = [],
                q = null;

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

            if (filters.length > 0) {
                q = { 'filters': filters }
            }

            return q;
        }

        return {

            treemap: function() {
                return $http.get('/data/treemap_elecciones.json');
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
            }

        }
    });