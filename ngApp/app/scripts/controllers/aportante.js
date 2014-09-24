'use strict';

angular.module('larutadeldinero')
    .controller('AportanteCtrl', function($scope, $routeParams, Aportantes) {
        var idNumber = $routeParams.documento;

        Aportantes.findById(idNumber).then(function(response) {
            $scope.aportante = response.data.objects[0];
        })
    });