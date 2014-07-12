angular.module('app', ['ngRoute','localytics.directives','controller-treemap'])

.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/treemap', {
        templateUrl: 'static/partials/treemap.html',
        controller: 'TreeMapCtrl'
      }).
      when('/map', {
        templateUrl: 'static/partials/map.html',
        controller: 'MapCtrl'
      }).
      otherwise({
        redirectTo: '/treemap'
      });
}])
.controller("MapCtrl", function ($scope, $q) {
    $scope.aportantes = [
        {
            DOCUMENTO: "904794",
            "CUIT/L": "23-904794-1",
            NOMBRE: "Pedro",
            APELLIDO: "Ramirez"
        }
    ];
})
;