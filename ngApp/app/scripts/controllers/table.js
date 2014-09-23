'use strict';

angular.module('larutadeldinero')
    .controller('TableCtrl', function ($scope, API) {
        API.aportes(1).then(function(response) {
            console.log(response);        //TODO(gb): Remove trace!!!
        })
    });