'use strict';

app
  .directive('tipoVisualizacion', function () {
    return {
      templateUrl: 'views/tipoVisualizacion.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  });
