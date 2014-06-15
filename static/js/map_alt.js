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

    queue()
        .defer(d3.json, "data/argentina.json")
        .defer(d3.csv, "data/aportes_2013_all.csv")
        .await(ready);

    function ready(error, argentina, aportes) {
        var mainData = aportes
            .filter(function(d){return d["AGRUPACION"] != '' && d["AGRUPACION"];})
            .filter(function(d){return d["DEPARTAMENTO"] != '' && d["DEPARTAMENTO"];});

        var nest = d3.nest()
            .key(function(d) {return d["DEPARTAMENTO"];})
            .rollup(function(leaves) {return leaves.length;})
        ;

        $scope.$apply(function(){
            $scope.filters = {
                agrupacion: {
                    selected: null,
                    values: sortKeysByValue(d3.nest()
                        .key(function (d) {return d["AGRUPACION"];})
                        .rollup(function(leaves) {return d3.sum(leaves, function(d){return parseFloat(d["IMPORTE"]);});})
                        .map(mainData, d3.map), d3.descending)
                },
                edad: {
                    selected: null,
                    values: d3.nest()
                        .key(function (d) {return d["EDAD"];})
                        .rollup(function(leaves) {return d3.sum(leaves, function(d){return parseFloat(d["IMPORTE"]);});})
                        .map(mainData, d3.map).keys().sort()
                }
            };
        });

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
        });

        for(var field in $scope.filters) {
            $scope.$watch('filters.' + field + '.selected', function(field){return function(selected) {
                if (selected) {
                    filters[field] = function (d) {return d[field] == selected.toUpperCase();};
                } else {
                    delete filters[field];
                }

                render();
            }}(field.toUpperCase()));
        }

        render();
    }
});