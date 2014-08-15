var aportesApp = angular.module('aportesApp', ['ui.bootstrap']);

aportesApp.controller('PaginationCtrl', function ($scope, $http) {
  console.log('setting up the controller for pagination')

  /// Getting the json file data ///
  $http.get('data/aportes_con_nombre.json')
       .success(function(data){
          $scope.aportes = data;
        });

//   $scope.setPage = function (pageNo) {
//     $scope.currentPage = pageNo;
//   };
//
//   $scope.pageChanged = function() {
//     console.log('Page changed to: ' + $scope.currentPage);
//   };
//
//   $scope.totalItems = 100;//$scope.aportes.length;
//   $scope.currentPage = 1;
//   $scope.maxSize = 5;
//   $scope.bigTotalItems = 175;
//   $scope.bigCurrentPage = 1;
});

aportesApp.controller('FiltrosCtrl', function ($scope) {

  $scope.ciclos = [2007,2009,2011,2013];

  $scope.provincias = [ "BUENOS AIRES", "CAPITAL FEDERAL", "CATAMARCA","CHACO","CHUBUT","CORDOBA","CORRIENTES","ENTRE RIOS", "FORMOSA","JUJUY","LA PAMPA","LA RIOJA", "MENDOZA", "MISIONES", "NEUQUEN","ORDEN NACIONAL", "RIO NEGRO", "SALTA", "SAN JUAN", "SAN LUIS", "SANTA CRUZ", "SANTA FE", "SANTIAGO DEL ESTERO", "TIERRA DEL FUEGO","TUCUMAN"];

  $scope.dprovincia = '';//$scope.provincias[1];
  $scope.aprovincia = '';//$scope.provincias[1];

  $scope.partidos = ["partido1", "partido2", "partido3"];

  $scope.elecciones = ["Primarias", "Generales"];
});


aportesApp.controller('TabsCtrl', function($scope) {

    $scope.workspaces =
    {
        "treemap": { id: 1, name: "TreeMap", collapsed:false  },
        "mapa": { id: 2, name: "Map", collapsed:true },
        "graficos": { id: 3, name: "Graficos", collapsed:true },
        "agrupaciones": { id: 4, name: "Agrupaciones", collapsed:true }
    };

    var setAllInactive = function() {
        for (var workspace in $scope.workspaces) {
          $scope.workspaces[workspace].collapsed = true;
          document.getElementById(workspace).className = "";
        };
    };

    $scope.open = function(workspace) {
      setAllInactive();
      $scope.workspaces[workspace].collapsed = false;
      document.getElementById(workspace).className = "active";
    };
});
