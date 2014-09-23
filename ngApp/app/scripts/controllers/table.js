'use strict';

angular.module('larutadeldinero')
    .controller('TableCtrl', function ($scope, $rootScope, API) {
        $scope.currentPage = 1;
        $scope.maxSize = 10;

        $scope.pageChanged = function() {
            $scope.fetching = true;
            API.aportes($scope.currentPage).then(function(response) {
                $scope.fetching = false;
                $scope.totalItems = response.data.num_results;
                $scope.totalPages = response.data.total_pages;
                $scope.aportes = response.data.objects;
            })
        };

        $rootScope.$on('filterChanged', function(event) {
            $scope.currentPage = 1;
            $scope.pageChanged();
        })
    });