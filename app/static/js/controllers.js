var aportesAppControllers = angular.module('aportesAppControllers', []);

// Controlador para los filtros
aportesAppControllers.controller('FiltrosCtrl', ['$scope', function ($scope) {

  $scope.ciclos = [2007,2009,2011,2013];

  $scope.provincias = [ "BUENOS AIRES", "CAPITAL FEDERAL", "CATAMARCA","CHACO","CHUBUT","CORDOBA","CORRIENTES","ENTRE RIOS", "FORMOSA","JUJUY","LA PAMPA","LA RIOJA", "MENDOZA", "MISIONES", "NEUQUEN","ORDEN NACIONAL", "RIO NEGRO", "SALTA", "SAN JUAN", "SAN LUIS", "SANTA CRUZ", "SANTA FE", "SANTIAGO DEL ESTERO", "TIERRA DEL FUEGO","TUCUMAN"];

  $scope.dprovincia = '';//$scope.provincias[1];
  $scope.aprovincia = '';//$scope.provincias[1];

  //Agrupaciones.then(function(data){
  //  $scope.partidos = data;
  //});

  //$scope.partidos = ["partido1", "partido2", "partido3"];

  $scope.elecciones = ["Primarias", "Generales"];
}]);

// Este controlador maneja las tabs para las diferentes visualizaciones
aportesAppControllers.controller('TabsCtrl', function($scope) {

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

      console.log(workspace);
      console.log("WHAAAAT");

      switch(workspace) {
          case "treemap":
            console.log("entro ent reeemap-----");
            $scope.isFiltersDisable = true;
            $scope.mostrar_agrupar_por = false;
            break;
          case "graficos":
            console.log("entro en graficos ------");
            $scope.isFiltersDisable = false;
            $scope.mostrar_agrupar_por = true;
            break;
          case "mapa":
            console.log("entro en mapa -----");
            $scope.isFiltersDisable = false;
            $scope.mostrar_agrupar_por = false;
            break;
          case "agrupaciones":
            console.log("entro en agrupaciones ------");
            $scope.isFiltersDisable = false;
            $scope.mostrar_agrupar_por = false;
            break;
      };
    };
});
