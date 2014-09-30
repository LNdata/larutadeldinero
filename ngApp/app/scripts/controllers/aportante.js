'use strict';

angular.module('larutadeldinero')
    .controller('AportanteCtrl', function($scope, $stateParams, Aportantes) {
        var idNumber = $stateParams.documento;

        Aportantes.findById(idNumber).then(function(response) {
            $scope.aportante = response.data.objects[0];
        })
    });