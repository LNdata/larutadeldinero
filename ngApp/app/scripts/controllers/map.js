'use strict';

angular.module('larutadeldinero')
    .controller('MapCtrl', function ($scope,$http) {

   $scope.map = L.map('map', {
			center: [-34.5957733,-58.3814453],
			maxZoom: 17,
			zoom: 11,
			zoomControl: false
	});

   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo($scope.map);

    	$scope.center={
    		        lat: 24.0391667,
                    lng: 121.525,
                    zoom: 8
    	}


    	var colors = ['FF0000', '0000FF','00FF00'];
    	var markers=[];
    	markers[0]=[];
    	markers[1]=[];
    	markers[2]=[];

    	

 
    	$http.get('data/reduced.csv').success(function(data){

    		var lines = data.split('\n');
    		lines.splice(0,1);

    		var points = [];
    		
        	for(var i=0;i<lines.length-2;i++){
        		var line = lines[i].split(',');
        		var layer=i%3?'northTaiwan':'southTaiwan';
        		points.push({'monto':line[1],'layer':layer,'lat':parseFloat(line[0]),'lng':parseFloat(line[2])});
        	}
        	
			for(var i = 0; i < points.length; i++){
			        var marker = new L.CircleMarker([points[i]['lat'],points[i]['lng']], {monto:points[i]['monto'],radius: 1+Math.log(points[i]['monto']), fillOpacity: 0.8, color: '#'+colors[i%3]}).bindPopup('layer '+i);
			        marker.l = i%3;
			        markers[i%3].push(marker);
			}
			
			for(var i = 0; i < markers.length; i++) {
			    var cluster = new L.MarkerClusterGroup({
        			iconCreateFunction: function(cl) {
	        				var sum=0;
	        				cl.getAllChildMarkers().map(function(child){
	        					sum+=parseInt(child.options.monto);
	        				});
	        				var montoClass="1";
	        				if(sum<1000){
	        					montoClass=1;
	        				}else if( sum<20000){
	        					montoClass=2;
	        				}else if( sum<100000){
	        					montoClass=3;
	        				}else if( sum<1000000){
	        					montoClass=4;
	        				}else if( sum< 10000000){
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
			    for(var j = 0; j < markers[i].length; j++){
			        cluster.addLayer(markers[i][j]);
			    }
			    console.log('adding cluster');
			    $scope.map.addLayer(cluster);
			}


    	})
    });
