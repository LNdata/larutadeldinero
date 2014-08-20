'use strict';

app
  .directive('filtros', function () {
    return {
      templateUrl: 'views/filtros.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      }
    };
  });
