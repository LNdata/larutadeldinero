function sortKeysByValue(_a, cmp) {
    return _a.keys().sort(function(a,b){return cmp(_a.get(a),_a.get(b));});
}

angular
    .module('aportesApp', ['ngRoute','aportesAppControllers', 'localytics.directives'])
    .filter('offset', function() {
        return function(input, start) {
            if (input) {
                start = parseInt(start, 10);
                return input.slice(start);
            }
        };
    })
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/map', {
                    templateUrl: 'static/partials/map.html',
                    controller: 'MapCtrl'
                }).
                otherwise({
                    redirectTo: '/map'
                });
        }
    ])
;