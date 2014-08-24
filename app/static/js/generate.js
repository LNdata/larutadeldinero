function pointInPolygon (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

$(function () {
    var width = 400,
        height = 800;

    var cantidadPorDepartamento = d3.map();

    var quantize = d3.scale.quantize()
        .domain([0, .15])
        .range(d3.range(9).map(function (i) {
            return "q" + i + "-9";
        }));

    var projection = d3.geo.transverseMercator()
        .center([2.5, -38.5])
        .rotate([66, 0])
        .scale(1280)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    queue()
        .defer(d3.json, "/data/argentina.json")
        .defer(d3.csv, "/data/aportes_2013.csv")
        .defer(d3.csv, "/data/aportes_primarias_2013_geo.csv")
        .await(ready);

    function ready(error, argentina, aportantes, geo) {
        var departamentos = topojson.feature(argentina, argentina.objects.departamentos);

        for(var i in geo){
            var persona = geo[i];

            var cuit = persona["CUIT/CUIL"];

            for (var j in departamentos.features) {
                var departamento = departamentos.features[j];

                if (!departamento.geometry) {
                    continue;
                }

                for (var k in departamento.geometry.coordinates) {
                    var coordinates = departamento.geometry.coordinates[k];

                    if (pointInPolygon([+persona["LON"], +persona["LAT"]], coordinates)) {
                        persona["DEPARTAMENTO"] = departamento.id;
                        break;
                    }
                }

                if ("DEPARTAMENTO" in persona) {
                    break;
                }
            }

            var found = false;
            for (var j in aportantes) {
                var aportante = aportantes[j];

                if (aportante["CUIT/L"] == cuit || aportante["DOCUMENTO"] == cuit) {
                    aportante["DEPARTAMENTO"] = ("DEPARTAMENTO" in persona)?persona["DEPARTAMENTO"]:"";
                    aportante["LAT"] = persona["LAT"];
                    aportante["LON"] = persona["LON"];
                    found = true;
                }
            }
        }

        console.log(JSON.stringify(aportantes);

        svg.append("g")
            .attr("class", "departamentos")
            .selectAll("path")
            .data(topojson.feature(argentina, argentina.objects.departamentos).features)
            .enter().append("path")
            //.attr("class", function(d) { return quantize(cantidadPorDepartamento.get(d.id)); })
            .attr("d", path);

        svg.append("g")
            .attr("class", "provincias")
            .selectAll("path")
            .data(topojson.feature(argentina, argentina.objects.provincias).features)
            .enter().append("path")
            .attr("d", path);
    }

    d3.select(self.frameElement).style("height", height + "px");
});