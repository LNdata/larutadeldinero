'use strict';

angular.module('larutadeldinero')
    .controller('MapCtrl', function ($scope, $http, $rootScope, Aportantes) {

        $scope.layers=[];
        $scope.map = L.map('map', {
            center: [-34.5957733,-58.3814453],
            maxZoom: 17,
            zoom: 11,
            zoomControl: false
        });

        var mapLink='<a href="http://openstreetmap.org">OpenStreetMap</a>';

        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; ' + mapLink + ' Contributors'
            }).addTo($scope.map);

        L.control.zoom().addTo($scope.map);

        $scope.center={
            lat: 24.0391667,
            lng: 121.525,
            zoom: 8
        };



        var colors = ['868a08','386cb0','61380b','d7191c','018571','969696'];
        var markers=[];

        $rootScope.$on('filterChanged',function(event){
            $scope.addDataToMap();
        });

        $scope.addDataToMap=function(){
            if($scope.layers.length>0){
                $scope.layers.forEach(function(d,i){
                    $scope.map.removeLayer(d);
                })
                $scope.layers=[];
            }

            if($scope.loading){
                return false;
            }

            $scope.loading=true;
            Aportantes.forMap().then(function(response) {
                var points = response.data.objects.filter(function(point) {
                    return point.aportes.length > 0;
                });

                $(points).each(function(i,d) {
                    var color = d.aportes[0].color;
                    if(!markers[color]) {
                        markers[color]=[];
                    }
                    var item = d;
                    item['layer']=colors.indexOf(color);
                    var monto = item.aportes.reduce(function(sum, aporte) { return sum + aporte.importe }, 0)

                    var marker = new L.CircleMarker(
                        [item['lat'], item['lon']],
                        {
                            dni: item['documento'],
                            monto: monto,
                            radius: Math.log(monto),
                            fillOpacity: 0.8,
                            color: "#"+color
                        }
                    );

                    marker.l = color;
                    markers[color].push(marker);
                });

                for(var key in markers) {
                    var cluster = new L.MarkerClusterGroup({
                        iconCreateFunction: function(cl) {
                            var sum=0;
                            cl.getAllChildMarkers().map(function(child){
                                sum+=parseInt(child.options.monto);
                            });
                            var montoClass="1";
                            if(sum<5000){
                                montoClass=1;
                            }else if( sum<20000){
                                montoClass=2;
                            }else if( sum<50000){
                                montoClass=3;
                            }else if( sum<100000){
                                montoClass=4;
                            }else if( sum< 500000){
                                montoClass=5;
                            }else{
                                montoClass=6;
                            }

                            var layer = cl.getAllChildMarkers()[0].l;

                            return new L.DivIcon({ html: '<div style="background-color:transparent; overflow:hidden"><div class=" circle' + montoClass + '" style="background:#'+layer+';"></div></div>' });
                        },
                        spiderfyDistanceMultiplier:	1,
                        showCoverageOnHover:false,
                        disableClusteringAtZoom:14,
                        maxClusterRadius:80
                    });

                    cluster.on('click',function(marker){

                        var dni = marker.layer.options.dni;
                        Aportantes.findById(dni).then(function(response){
                            var popUp=new L.Popup();
                            popUp.setLatLng(marker.layer._latlng);
                            var aportante=response.data.objects[0];
                            var sum=0;
                            aportante.aportes.forEach(function(a){
                                sum+=parseInt(a.importe);
                            })
                            var link = ""
                            popUp.setContent('<div><p style="margin:0;">' + aportante.apellido +', ' + aportante.nombre + '</p><p style="margin:0;">' + sum +  '$</p><p style="margin:0;"><a href="#/aportante/' + dni +'">Ficha</a></p><div>');
                            $scope.map.openPopup(popUp);
                        });

                    });


                    for(var j = 0; j < markers[key].length; j++){
                        cluster.addLayer(markers[key][j]);
                    }
                    $scope.layers.push(cluster);
                    $scope.map.addLayer(cluster);
                    $scope.loading=false;
                }

            });

        };

        $scope.addDataToMap();
    });

