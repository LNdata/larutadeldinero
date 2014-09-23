'use strict';

angular.module('larutadeldinero')
    .factory('API', function($http) {
        var baseURL = 'http://origen.larutaelectoral.com.ar/api';

        return {

            treemap: function() {
                return $http.get('/data/treemap_elecciones.json');
            },

            aportantes: function(page) {
                return $http.get(baseURL + '/aportantes' + '?page=' + page);
            },

            aportes: function(page) {
                return $http.get(baseURL + '/aportes' + '?page=' + page);
            }

        }
    });