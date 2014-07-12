angular.module('app', ['localytics.directives'])

.controller("ProtoController", function ($scope, $q) {
    $scope.aportantes = [
        {
            DOCUMENTO: "904794",
            "CUIT/L": "23-904794-1",
            NOMBRE: "Pedro",
            APELLIDO: "Ramirez"
        }
    ];
});