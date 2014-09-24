'use strict';

angular.module('larutadeldinero')
    .controller('MapCtrl', function ($scope, $http, API,$rootScope) {

    	$scope.layers=[];
        $scope.map = L.map('map', {
            center: [-34.5957733,-58.3814453],
            maxZoom: 17,
            zoom: 11,
            zoomControl: false
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
        })
        
        

		$scope.addDataToMap=function(){
			if($scope.layers.length>0){
				$scope.layers.forEach(function(d,i){
					$scope.map.removeLayer(d);
					console.log('refreshing map');
				})
				$scope.layers=[];
			}

			if($scope.loading){
				return;
			}
			
			$scope.loading=true;
			API.mapdata().then(function(response) {
	            var points = response.data.values;
	            
	            $(points).each(function(i,d){
	            	if(!markers[d['color']]){
	            		markers[d['color']]=[];
	            	}
	            	var item=d;
	            	item['layer']=colors.indexOf(d['color']);
	            	var marker = new L.CircleMarker([item['latitud'],item['longitud']], {monto:item['monto'],radius: Math.log(item['monto']), fillOpacity: 0.8, color: "#"+item['color']}).bindPopup('layer '+i);
	                marker.l = colors.indexOf(d['color']);
	                markers[d['color']].push(marker);
	            })        //TODO(gb): Remove trace!!!

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
	                        return new L.DivIcon({ html: '<div style="background-color:transparent; overflow:hidden"><div class=" layer'+layer+' circle' + montoClass + '"></div></div>' });
	                    },
	                    spiderfyDistanceMultiplier:	1,
	                    showCoverageOnHover:false,
	                    disableClusteringAtZoom:14,
	                    maxClusterRadius:50
	                });



	                for(var j = 0; j < markers[key].length; j++){
	                    cluster.addLayer(markers[key][j]);
	                }
	                $scope.layers.push(cluster);
	                console.log($scope.layers);
	                $scope.map.addLayer(cluster);
	                $scope.loading=false;
				}

		});
    
    }
});

