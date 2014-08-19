var aportesApp = angular.module('aportesApp', [
  'ui.bootstrap',
  'ngRoute',
  'aportesAppControllers'
]);

// aportesApp.config(['$routeProvider',
//   function($routeProvider) {
//     $routeProvider.
//       when('/', {
//         templateUrl: 'partials/aportes.html',
//         controller: 'TablaDatosCtrl'
//       }).
//       when('/aportes', {
//         templateUrl: 'partials/phone-list.html',
//         controller: 'TablaDatosCtrl'
//       }).
//       when('/aportes/:aporteId', {
//         templateUrl: 'partials/phone-detail.html',
//         controller: 'TablaDatosCtrl'
//       }).
//       when('/aportantes', {
//         templateUrl: 'partials/phone-list.html',
//         controller: 'TablaDatosCtrl'
//       }).
//       when('/aportantes/:aportanteId', {
//         templateUrl: 'partials/phone-list.html',
//         controller: 'TablaDatosCtrl'
//       }).
//       otherwise({
//         redirectTo: '/'
//       });
//   }]);
