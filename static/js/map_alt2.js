function sortKeysByValue(_a, cmp) {
    return _a.keys().sort(function(a,b){return cmp(_a.get(a),_a.get(b));});
}

angular.module('app', ['localytics.directives'])

.controller('MapController', function ($scope, $q) {
    var width = 550,
        height = 1050;

    var projection = d3.geo.transverseMercator()
        .center([2.5, -38.5])
        .rotate([66, 0])
        .scale(1800)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    $scope.aportantes = [];

    queue()
        .defer(d3.json, "data/argentina.json")
        .defer(d3.csv,  "data/aportes_2013.csv")
        .defer(d3.csv,  "data/aportes_primarias_2013_geo.csv")
        .defer(d3.csv,  "data/aportes_sexo_2013.csv")
        .await(ready);

    function ready(error, argentina, aportes, aportes_geo, aportes_sexo) {
        var geo = d3.nest()
            .key(function(d){return d["CUIT/CUIL"];})
            .map(aportes_geo, d3.map);

        var sexo = d3.nest()
            .key(function(d){return d["DOCUMENTO"]})
            .map(aportes_sexo, d3.map);

        aportes = aportes.map(function(aporte){
            var key = aporte["CUIT/L"] || aporte["DOCUMENTO"];

            var geo_data = geo.get(key);
            if (geo_data && geo_data.length == 1) {
                aporte = $.extend(aporte, geo_data[0]);
            }

            var sexo_data = sexo.get(aporte["DOCUMENTO"]);
            if (sexo_data && sexo_data.length == 1) {
                aporte = $.extend(aporte, sexo_data[0]);
            }

            return aporte;
        });

        var mainData = aportes
            .filter(function(d){return d["AGRUPACION"] != '' && d["AGRUPACION"];})
            .filter(function(d){return d["DEPARTAMENTO"] != '' && d["DEPARTAMENTO"];})
        ;

        var nest = d3.nest()
            .key(function(d) {return d["DEPARTAMENTO"];})
            .rollup(function(leaves) {return leaves.length;})
        ;

        $scope.filters = {
            agrupacion: {
                selected: null,
                values: sortKeysByValue(d3.nest()
                    .key(function (d) {return d["AGRUPACION"];})
                    .rollup(function(leaves) {return d3.sum(leaves, function(d){return parseFloat(d["IMPORTE"]);});})
                    .map(mainData, d3.map), d3.descending)
            },
            edad: {
                filter: function($field, selected) {return function (d) {
                    var firstDigits = +d["DOCUMENTO"].split('').reverse().slice(6).reverse().join('');

                    if (firstDigits == 19) {
                        return false;
                    } else if (firstDigits < 10) {
                        return selected == $field.values[0];
                    } else if (firstDigits < 17) {
                        return selected == $field.values[1];
                    } else if (firstDigits < 24) {
                        return selected == $field.values[2];
                    } else if (firstDigits < 31) {
                        return selected == $field.values[3];
                    } else {
                        return selected == $field.values[4];
                    }
                };},
                selected: null,
                values: [
                    "65 o más",
                    "50 - 65",
                    "40 - 49",
                    "30 - 39",
                    "29 o menos"
                ]
            },
            sexo: {
                selected: null,
                values: [
                    "F",
                    "M"
                ]
            }
        };

        var filters = {};

        var colors = colorbrewer.Blues[9];

        var scale = d3.scale.log()
            .range([0,colors.length-1]);

        var legendBox = d3.select('#legend')
            .append('ul')
            .attr('class', 'list-inline');

        var legend = legendBox.selectAll('li.key')
            .data(colors)
            .enter().append('li')
            .attr('class', 'key')
            .style('border-top-color', String);

        var departamentos = svg.append("g")
            .attr("class", "departamentos")
            .selectAll("path")
            .data(topojson.feature(argentina, argentina.objects.departamentos).features)
            .enter().append("path")
            .attr("data-name", function(d) {
                return d3.map(d.properties).values().join(", ");
            })
            .attr("d", path);

        svg.append("g")
            .attr("class", "provincias")
            .selectAll("path")
            .data(topojson.feature(argentina, argentina.objects.provincias).features)
            .enter().append("path")
            .attr("data-name", function(d) {
                return d3.map(d.properties).values().join(", ");
            })
            .attr("d", path);

        function render() {
            var _data = mainData;

            for (var i in filters) {
                _data = _data.filter(filters[i]);
            }

            $scope.aportantes = _data;

            var data = nest.map(_data, d3.map);

            scale.domain([d3.min(data.values())+1, d3.max(data.values())]);

            legend.text(function (d, i) { return Math.round(scale.invert(i));});

            departamentos.attr("fill", function (d) {
                var stats = data.get(d.id);
                var index = scale(stats?stats:0);

                if (index >= 0) {
                    return colors[Math.round(index)];
                } else {
                    return colors[0];
                }
            });
        };

        $("#aggregation").on("change", "input", function(){
            var field = $(this).data("field").toUpperCase();

            if (field == "COUNT") {
                nest.rollup(function(leaves) {return leaves.length;});
            } else {
                nest.rollup(function(leaves) {return d3.sum(leaves, function(d){return parseFloat(d[field]);});});
            }

            render();
            $scope.$apply();
        });

        for(var field in $scope.filters) {
            $scope.$watch('filters.' + field + '.selected', function($field, field){return function(selected) {
                if (selected) {
                    if ($field.filter) {
                        filters[field] = $field.filter($field, selected);
                    } else {
                        filters[field] = function (d) {return d[field] == selected.toUpperCase();};
                    }
                } else {
                    delete filters[field];
                }

                render();
            }}($scope.filters[field], field.toUpperCase()));
        }

        render();
        $scope.$apply();
    }
});