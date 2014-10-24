'use strict';

angular.module('larutadeldinero')
    .controller('MapCtrl', function ($scope, $http, $rootScope, Aportantes, Aportes) {

        $scope.layers=[];
        $scope.map = L.map('map', {
            center: [-34.5957733,-58.3814453],
            maxZoom: 17,
            zoom: 11,
            zoomControl: false,
			fullscreenControl: true,
			fullscreenControlOptions: {
				position: 'topleft'
			}
        });

        var mapLink='<a href="http://openstreetmap.org">OpenStreetMap</a>';
	
        L.tileLayer(
            'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', {
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
            Aportes.forMap().then(function(response) {
                var points = response.data.values;

                $(points).each(function(i,d) {
                    var color = d.color;
                    if(!markers[color]) {
                        markers[color]=[];
                    }
                    var item = d;
                    item['layer']=colors.indexOf(color);
                    var monto = item.monto;

                    var marker = new L.CircleMarker(
                        [item['latitud'], item['longitud']],
                        {
                            dni: item['documento'],
                            monto: monto,
                            radius: (Math.round(Math.sqrt(monto))/11.5),
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
                            }else if( sum<10000){
                                montoClass=2;
                            }else if( sum<20000){
                                montoClass=3;
                            }else if( sum<50000){
                                montoClass=4;
                            }else if( sum<100000){
                                montoClass=5;
                            }else if( sum<500000) {
                                montoClass=6;
                            }else {
								montoClass=7;
							}

                            var layer = cl.getAllChildMarkers()[0].l;

                            return new L.DivIcon({ html: '<div style="background-color:transparent; overflow:hidden"><div class=" circle' + montoClass + '" style="background:#'+layer+';"></div></div>' });
                        },
                        spiderfyDistanceMultiplier:	1,
                        showCoverageOnHover:false,
                        disableClusteringAtZoom:14,
                        maxClusterRadius:80
                    });

                    cluster.on('mouseover',function(marker){

                        var dni = marker.layer.options.dni;
                        Aportantes.findById(dni).then(function(response){
                            var popUp=new L.Popup();
                            popUp.setLatLng(marker.layer._latlng);
                            var aportante=response.data.objects[0];
                            var sum=0;
							var ciclo=0;
							var codlista="";
                            aportante.aportes.forEach(function(a){
                                sum+=parseInt(a.importe)
								ciclo=(a.ciclo)
								codlista=(a.codlista);
                            })
                            var link = ""
                            popUp.setContent('<div><p style="margin:0;"><img src="images/boletas/' + ciclo + '/' + codlista + '.jpg" height="120"></p><p style="margin:0;">$' + sum +  '</p><p>' + aportante.apellido +', ' + aportante.nombre + '</p><p><img src="images/icons/' + aportante.sexo + '.png" height="32"><img src="images/icons/imp_iva/' + aportante.impuesto_iva + '.png" title="Impuesto al Valor Agregado"><img src="images/icons/imp_ganancias/' + aportante.impuesto_ganancias + '.png" title="Impuesto a las Ganancias"><img src="images/icons/monotributo/' + aportante.monotributo +'.png" title="Monotributo categoría '+ aportante.monotributo +'"><img src="images/icons/empleador/'+ aportante.empleador +'.png" title="Empleador"><img src="images/icons/designacion/' + aportante.designacion + '.gif" title="Designación"><img src="images/icons/candidatura/' + aportante.candidatura +'.gif" title="Candidatura">	<img src="images/icons/contrato/' + aportante.contrato + '.gif" title="Contrato"><img src="images/icons/autoridad/' + aportante.autoridad +'.gif" title="Autoridad partidaria"><img src="images/icons/mandato_diputado/' + aportante.mandato_diputado + '.gif" title="Mandato como Diputado"><img src="images/icons/mandato_senador/' + aportante.mandato_senador + '.gif" title="Mandato como Senador">');
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

