'use strict';

angular.module('larutadeldinero')
    // Cuando se inyectan dependencias en Angular y se va a minificar el código, en lugar de una función con las
    // dependencias, pasar un array con sus nombres (en strings) y la función, ya que los nombres de las variables
    // pueden cambiar.
    .controller('TableCtrl', ['$scope', '$rootScope', 'Aportes', 'Aportantes', '$modal', function($scope, $rootScope, Aportes, Aportantes, $modal) {
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
        });

        $scope.orderData = function() {
            $rootScope.$emit('filterChanged');
        };

        $scope.setParty = function(partyId) {
            var party = $rootScope.parties.filter(function(par) { return par.id == partyId; });
            $rootScope.filter.party = party[0];
            $rootScope.$apply();
        };

        $scope.open_modal = function(documento) {

            Aportantes.findById(documento).then(function(response) {
                $modal.open({
                    templateUrl: 'views/modals/modal_table.html',
                    controller: 'AportanteModalCtrl',
                    resolve: {
                        aportante: function () {
                            return response.data.objects[0];
                        }
                    }
                });
            });
        }
    }])
    .controller('AportanteModalCtrl', function ($scope, $modalInstance, aportante) {
        $scope.aportante = aportante;

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    });