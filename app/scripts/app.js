'use strict';

var app = angular.module('rutadineroApp', [
  'ngRoute',
  'ui.bootstrap',
  'ui.layout'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
