'use strict';

angular.module('larutadeldinero')
    .controller('ChartsCtrl', function ($scope, $rootScope, Aportes) {

        $scope.refreshData = function() {

            // Aportantes
            Aportes.aportantesBySex().then(function(response) {
                $scope.aportantesBySex = response.data.objects[0][0].values;
            });

            Aportes.aportantesByAge().then(function(response) {
                $scope.aportantesByAge = response.data.objects[0].values;
            });

            Aportes.aportantesByAgrupacion().then(function(response) {
                $scope.aportantesByAgrupacion = response.data.objects[0].values;
            });

            // Aportes
            Aportes.bySex().then(function(response) {
                $scope.aportesBySex = response.data.objects[0].values;
            });

            Aportes.byAge().then(function(response) {
                $scope.aportesByAge = response.data.objects[0].values;
            });

            Aportes.byAgrupacion().then(function(response) {
                $scope.aportesByAgrupacion = response.data.objects[0].values;
            });
        };

        setTimeout(function() {
            $scope.refreshData();
        })


        $rootScope.$on('filterChanged', function(event) {
            $scope.refreshData();
        })

    })

    .directive('barChart', function($rootScope) {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },

            link: function(scope, element, attrs) {

                setTimeout(function() {
                    var containerWidth = $('#' + attrs.containerId).width() * (attrs.widthFactor ? parseFloat(attrs.widthFactor) : 1);

					var color = d3.scale.ordinal()
						.range(colorbrewer.Blues[6]);
					
                    var margin = {top: 20, right: 20, bottom: parseInt(attrs.marginBottom) || 30, left: 40},
                        width = containerWidth - margin.left - margin.right,
                        height = attrs.height - margin.top - margin.bottom,
                        yAxisLabel = attrs.yAxisLabel || '',
                        yAxisMax = attrs.yAxisMax,
                        ticks = attrs.yAxisTicks || 10,
                        title = attrs.chartTitle || '',
                        loaded = false;

                    var x = d3.scale.ordinal()
                        .rangeRoundBands([0, width], .1);
					
					var fmt = d3.format(",.0f");
					
                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .ticks(ticks);

                    if (attrs.yAxisTickFormat) {
                        yAxis.tickFormat(d3.format(attrs.yAxisTickFormat));
                    }

                    var svg = d3.select(element[0]).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    svg.append('g')
                        .attr('class', 'title')
                        .append('text')
                        .style('text-anchor', 'middle')
                        .attr('x', width/2)
                        .attr('y', -margin.top/2)
                        .text(title);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")

                    svg.append("g")
                        .attr("class", "y axis")
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text(yAxisLabel);

                    scope.$watch('data', function(data) {
                        if (!data) return false;

                        x.domain(data.map(function(d) { return d.label; }));
                        y.domain([0, yAxisMax || d3.max(data, function(d) { return (d.value); })]);

                        svg.select('.x.axis')
                            .call(xAxis)
                            .selectAll("text")
                            .call(wrap, x.rangeBand());

                        svg.select('.y.axis')
                            .call(yAxis);

                        var bar = svg.selectAll(".bar")
                            .data(data);

                        bar.enter().append("rect")
                            .attr("class", "bar")
                            .attr("x", function(d) { return x(d.label); })
                            .attr("width", x.rangeBand())
                            .attr("y", height)
                            .attr("height", 0)
							.style("fill", function(d) {
                            return color(d.label);
                        });
						
						bar.data(data)
						.call(d3.helper.tooltip_chart(function(d) { return (fmt(d.value)).replace(',','.').replace(',','.');}));

                        bar.attr("width", x.rangeBand());

                        bar.transition()
                            .attr("y", function(d) { return y(d.value); })
                            .attr("height", function(d) { return height - y(d.value); })

                        bar.exit()
                            .remove();

                    });

                    function wrap(text, width) {
                        text.each(function() {
                            var text = d3.select(this),
                                words = text.text().split(/\s+/).reverse(),
                                word,
                                line = [],
                                lineNumber = 0,
                                lineHeight = 1.1, // ems
                                y = text.attr("y"),
                                dy = parseFloat(text.attr("dy")),
                                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                            while (word = words.pop()) {
                                line.push(word);
                                tspan.text(line.join(" "));
                                if (tspan.node().getComputedTextLength() > width) {
                                    line.pop();
                                    tspan.text(line.join(" "));
                                    line = [word];
                                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                                }
                            }
                        });
                    }
                }, 500)
            }
        };
    });
