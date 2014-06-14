$(function () {
    var width = 550,
        height = 1050;

    var departamentos = d3.map();

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
        var data = d3.nest()
            //.key(function(d) {return d["DISTRITO"];})
            .key(function(d) {return d["DEPARTAMENTO"];})
            /*
            .key(function(d) {return d["DEPARTAMENTO"];})
            .key(function(d) {return d["AGRUPACION"].toUpperCase();})
            .key(function(d) {return d["ELECCIONES"].toUpperCase();})
            .key(function(d) {return d["CARGO"].toUpperCase();})
            .key(function(d) {return d["APORTE"].toUpperCase();})
            */
            .rollup(function(leaves) {
                return leaves.length;
            })
            .map(aportes, d3.map);

        data.remove("");

        var colors = colorbrewer.Blues[9];

        var scale = d3.scale.log()
            .domain([d3.min(data.values())+1, d3.max(data.values())])
            .range([0,colors.length-1]);

        var legend = d3.select('#legend')
            .append('ul')
            .attr('class', 'list-inline');

        function keyLabel (d, i) {
                return Math.round(scale.invert(i));
        };

        var keys = legend.selectAll('li.key')
            .data(colors)
            .enter().append('li')
            .attr('class', 'key')
            .style('border-top-color', String)
            .text(keyLabel);

        function selectColor (d) {
            var stats = data.get(d.id);
            var index = scale(stats?stats:0);

            if (index >= 0) {
                return colors[Math.round(index)];
            } else {
                return colors[0];
            }
        }

        svg.append("g")
            .attr("class", "departamentos")
            .selectAll("path")
            .data(topojson.feature(argentina, argentina.objects.departamentos).features)
            .enter().append("path")
            .attr("data-name", function(d) {
                return d3.map(d.properties).values().join(", ");
            })
            .attr("fill", selectColor)
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

        // TODO: Refactorizar para no tener tanto codigo repetido
        $("#personas").on("change", function(){
            data = d3.nest()
                .key(function(d) {return d["DEPARTAMENTO"];})
                .rollup(function(leaves) {
                    return leaves.length;
                })
                .map(aportes, d3.map);

            data.remove("");

            scale.domain([d3.min(data.values())+1, d3.max(data.values())]);

            keys.text(keyLabel);

            svg
                .select(".departamentos")
                .selectAll("path")
                .attr("fill", selectColor);
        });

        $("#aportes").on("change", function(){
            data = d3.nest()
                .key(function(d) {return d["DEPARTAMENTO"];})
                .rollup(function(leaves) {
                    return d3.sum(leaves, function(d){return parseFloat(d["IMPORTE"]);});
                })
                .map(aportes, d3.map);

            data.remove("");
            data.remove(undefined);

            scale.domain([d3.min(data.values())+1, d3.max(data.values())]);

            keys.text(keyLabel);

            svg
                .select(".departamentos")
                .selectAll("path")
                .attr("fill", selectColor);
        });
    }
});