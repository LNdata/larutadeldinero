'use strict';

app
  .directive('visualizacion', function () {
    return {
      templateUrl: 'views/visualizacion.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
      },
      controller: function($scope){
              $scope.tabs = [
                  { title:'Dynamic Title 1', content:'Dynamic content 1' },
                  { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
              ];

              $scope.alertMe = function() {
                  setTimeout(function() {
                      alert('You\'ve selected the alert tab!');
                  });
              };
      }
    };
  });
