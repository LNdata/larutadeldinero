angular.module('aportesAppControllers', [])
    .factory('data', function($rootScope, $q){
        var deferred = $q.defer();

        queue()
            .defer(d3.json, "data/argentina.json")
            .defer(d3.csv,  "data/aportes_2013.csv")
            .defer(d3.csv,  "data/aportes_primarias_2013_geo.csv")
            .defer(d3.csv,  "data/aportes_sexo_2013.csv")
            .await(function(error, argentina, aportes, aportes_geo, aportes_sexo){
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

                $rootScope.filters = {
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

                function render() {
                    var _data = mainData;

                    for (var i in filters) {
                        _data = _data.filter(filters[i]);
                    }

                    $rootScope.aportantes = _data;


                };

                for(var field in $rootScope.filters) {
                    $rootScope.$watch('filters.' + field + '.selected', function($field, field){return function(selected) {
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
                    }}($rootScope.filters[field], field.toUpperCase()));
                }

                render();
                $rootScope.$apply();

                deferred.resolve([argentina, aportes, aportes_geo, aportes_sexo]);
            });

        return deferred.promise;
    })
    .controller("FiltersCtrl", function($rootScope, data) {
        data.then(function(_data){
            var nest = d3.nest()
                .key(function(d) {return d["DEPARTAMENTO"];})
                .rollup(function(leaves) {return leaves.length;})
            ;

            $rootScope.aportantesNested = nest.map($rootScope.aportantes, d3.map);

            $("#aggregation").on("change", "input", function(){
                var field = $(this).data("field").toUpperCase();

                if (field == "COUNT") {
                    nest.rollup(function(leaves) {return leaves.length;});
                } else {
                    nest.rollup(function(leaves) {return d3.sum(leaves, function(d){return parseFloat(d[field]);});});
                }

                $rootScope.aportantesNested = nest.map($rootScope.aportantes, d3.map);

                $rootScope.$apply();
            });
        });
    })
    .controller("MapCtrl", function($scope, data) {
        data.then(function(_data){
            var argentina = _data[0];

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

            $scope.$watch('aportantesNested', function(data) {
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
            });
        });
    })
    .controller("DataCtrl", function($scope){
        $scope.currentPage = 0;
        $scope.itemsPerPage = 50;


        $scope.prevPage = function() {
            $scope.currentPage--;
        };

        $scope.nextPage = function() {
            $scope.currentPage++;
        };
    })
    .controller("TreeMapCtrl", function($scope, data){
        data.then(function(){
            var margin = {top: 45, right: 0, bottom: 0, left: 0},
                width = 574,
                height = 600 - margin.top - margin.bottom,
                formatNumber = d3.format(",d"),
                transitioning;

            var color = d3.scale.ordinal()
                .range(colorbrewer.Dark2[7]);


            var x = d3.scale.linear()
                .domain([0, width])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, height])
                .range([0, height]);

            var treemap = d3.layout.treemap()
                .children(function(d, depth) { return depth ? null : d.values; })
                .sort(function(a, b) { return a.value - b.value; })
                .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
                .round(false);

            var svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.bottom + margin.top)
                .style("margin-left", -margin.left + "px")
                .style("margin.right", -margin.right + "px")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .style("shape-rendering", "crispEdges");

            var grandparent = svg.append("g")
                .attr("class", "grandparent");

            grandparent.append("rect")
                .attr("y", -margin.top)
                .attr("width", width)
                .attr("height", margin.top);

            grandparent.append("text")
                .attr("font-size", "22px")
                .attr("fill", "#FFF")
                .attr("x", 6)
                .attr("y", 10 - margin.top)
                .attr("dy", ".90em");

            var _data = d3.nest()
                .key(function(d) {return d["ELECCIONES"];})
                .key(function(d) {return d["DISTRITO"];})
                .key(function(d) {return d["AGRUPACION"];})
                .key(function(d) {return d["TIPO"];})
                .rollup(function(leaves) {return leaves.length;})
                .entries($scope.aportantes);

            var root = {
                key: "Elecciones",
                values: _data,
                x: 0,
                y: 0,
                dx: width,
                dy: height,
                depth: 0
            };

            accumulate(root);
            layout(root);
            display(root);

            function accumulate(d) {
                return Array.isArray(d.values)
                    ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
                : d.values;
            }

            function layout(d) {
                if (Array.isArray(d.values)) {
                    treemap.nodes({values: d.values});
                    d.values.forEach(function(c) {
                        c.x = d.x + c.x * d.dx;
                        c.y = d.y + c.y * d.dy;
                        c.dx *= d.dx;
                        c.dy *= d.dy;
                        c.parent = d;
                        layout(c);
                    });
                }
            }

            function display(d) {
                var g1 = svg.insert("g", " .grandparent")
                    .datum(d)
                    .attr("class", "depth");

                var g = g1.selectAll("g")
                    .data(d.values)
                    .enter().append("g");

                function transition(d) {
                    if (transitioning || !d) return;
                    transitioning = true;

                    var g2 = display(d),
                        t1 = g1.transition().duration(570),
                        t2 = g2.transition().duration(570);

                    // Update the domain only after entering new elements.
                    x.domain([d.x, d.x + d.dx]);
                    y.domain([d.y, d.y + d.dy]);

                    // Enable anti-aliasing during the transition.
                    //     svg.style("shape-rendering", null);

                    // Draw child nodes on top of parent nodes.
                    svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

                    // Fade-in entering text.
                    g2.selectAll("text").style("fill-opacity", 0);

                    // Transition to the new view.
                    t1.selectAll("text").call(text).style("fill-opacity", 0);
                    t2.selectAll("text").call(text).style("fill-opacity", 1);
                    t1.selectAll("rect").call(rect);
                    t2.selectAll("rect").call(rect);

                    // Remove the old node when the transition is finished.
                    t1.remove().each("end", function() {
                        svg.style("shape-rendering", "crispEdges");
                        transitioning = false;
                    });
                }

                grandparent
                    .datum(d.parent)
                    .on("click", transition)
                    .select("text")
                    .text(name(d));

                g.filter(function(d) { return d.values; })
                    .classed("children", true)
                    .on("click", transition);

                g.selectAll(".child")
                    .data(function(d) { return d.values || [d]; })
                    .enter().append("rect")
                    .attr("class", "child")
                    .call(rect);

                g.append("rect")
                    .attr("class", "parent")
                    .call(rect)
                    .append("title")
                    .text(function(d) { return d.key + ": $" + formatNumber(d.value); });

                g.append("text")
                    .attr("font-family", "'Yanone Kaffeesatz'")
                    .attr("font-size", "20px")
                    .attr("fill", "#FFFFFF")
                    .attr("dy", ".75em")
                    .text(function(d) { return d.key; })
                    .call(text);

                g.append("text")
                    .attr("font-family", "'Open Sans'")
                    .attr("font-size", "16px")
                    .attr("fill", "#FFF")
                    .attr("dy", "2.3em")
                    .text(function(d) { return "$" + formatNumber(d.value); })
                    .call(text);

                return g;
            }

            function text(text) {
                text.attr("x", function(d) { return x(d.x) + 6; })
                    .attr("y", function(d) { return y(d.y) + 10; });
            }

            function rect(rect) {
                rect.attr("x", function(d) { return x(d.x); })
                    .attr("y", function(d) { return y(d.y); })
                    .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
                    .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
                    .style("fill", function(d) {
                        return color(d.key);
                    });
            }

            function name(d) {
                return d.parent
                    ? name(d.parent) + " — " + d.key
                    : d.key;
            }
        });
    })
;