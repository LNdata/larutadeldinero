'use strict';

angular.module('larutadeldinero')
    .controller('MapCtrl', function ($scope,$http) {

   $scope.map = L.map('map', {
			center: [3.235002, 101.694028],
			maxZoom: 17,
			zoom: 11,
			zoomControl: false
	});

   L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo($scope.map);

    	$scope.center={
    		        lat: 24.0391667,
                    lng: 121.525,
                    zoom: 6
    	}


    	var colors = ['FF0000', '0000FF'];
    	var markers=[];
    	markers[0]=[];
    	markers[1]=[];

    	

 
    	$http.get('data/output2.csv').success(function(data){

    		var lines = data.split('\n');
    		lines.splice(0,1);

    		var points = [];
    		
        	for(var i=0;i<lines.length/2;i++){
        		var line = lines[i].split(',');
        		var layer=i%2?'northTaiwan':'southTaiwan';
        		points.push({'monto':line[1],'layer':layer,'lat':parseFloat(line[0]),'lng':parseFloat(line[2])});
        	}
        	
			for(var i = 0; i < points.length; i++){
			        var marker = new L.CircleMarker([points[i]['lat'],points[i]['lng']], {monto:points[i]['monto'],radius: 1+Math.log(points[i]['monto']), fillOpacity: 0.8, color: '#'+colors[i%2]}).bindPopup('layer '+i);
			        marker.l = i%2;
			        markers[i%2].push(marker);
			}
			
			for(var i = 0; i < markers.length; i++) {
			    var cluster = new L.MarkerClusterGroup({
        			iconCreateFunction: function(cl) {
	        				var sum=0;
	        				cl.getAllChildMarkers().map(function(child){
	        					sum+=parseInt(child.options.monto);
	        				});
	        	
	            			var layer = cl.getAllChildMarkers()[0].l;
	            			//return new L.CircleMarker(cl.getLatLng(),{radius:Math.log(sum)});
            				return new L.DivIcon({ html: '<div class="cluster layer'+layer+' circle10" >' + cl.getChildCount() + '-' + sum + '</div>' });
        				}	
			    	});
			    for(var j = 0; j < markers[i].length; j++){
			        cluster.addLayer(markers[i][j]);
			    }
			    console.log('adding cluster');
			    $scope.map.addLayer(cluster);
			}


    	})

    	    	$scope.layers={
                    "baselayers": {
					    "osm": {
					      "name": "OpenStreetMap",
					      "type": "xyz",
					      "url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
					      "layerOptions": {
					        "subdomains": [
					          "a",
					          "b",
					          "c"
					        ],
					        "attribution": "© OpenStreetMap contributors",
					        "continuousWorld": true
					      },
					      "layerParams": {}
					    }
  					},
  					'overlays':{
				    		"northTaiwan": {
						      "name": "North cities",
						      "type": "markercluster",
						      "visible": true,
						      
				    		},
				    		"southTaiwan": {
						      "name": "South cities",
						      "type": "markercluster",
						      "visible": true,
				    		}
    				}

    	}

    });
