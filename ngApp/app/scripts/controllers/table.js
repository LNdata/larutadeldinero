'use strict';

angular.module('larutadeldinero')
    .controller('TableCtrl', function ($scope, $rootScope, Aportes, Aportantes) {
        $scope.currentPage = 1;
        $scope.maxSize = 10;

        $scope.pageChanged = function() {
            $scope.fetching = true;
            Aportes.find($scope.currentPage).then(function(response) {
                $scope.fetching = false;
                $scope.totalItems = response.data.num_results;
                $scope.totalPages = response.data.total_pages;
                $scope.aportes = response.data.objects;
            });

            Aportes.stats().then(function(response) {
                $scope.average = response.data.avg_importe;
                $scope.sum = response.data.sum_importe;
            })

        };

        $scope.filterByName = function() {
            $scope.currentPage = 1;
            $scope.pageChanged();
        };

        $rootScope.$on('filterChanged', function(event) {
            $scope.currentPage = 1;
            $scope.pageChanged();
        })

        $scope.orderData = function() {
                $rootScope.$emit('filterChanged');
            }

        $scope.setParty = function(partyId) {
            var party = $rootScope.parties.filter(function(par) { return par.id == partyId; });
            $rootScope.filter.party = party[0];
            $rootScope.$apply();
        }

    });