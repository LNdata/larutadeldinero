'use strict';

angular.module('larutadeldinero')
.controller('AportanteCtrl', function($scope, $routeParams, API) {
        var idNumber = $routeParams.documento;

        API.aportanteById(idNumber).then(function(response) {
            $scope.aportante = response.data.objects[0];
        })
    });