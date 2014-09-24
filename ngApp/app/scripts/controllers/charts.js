'use strict';

angular.module('larutadeldinero')
    .controller('ChartsCtrl', function ($scope, API) {

        API.aportantesBySex().then(function(response) {
            $scope.aportesBySex = response.data.objects[0][0].values;
        });

        API.aportantesByAge().then(function(response) {
            $scope.aportesByAge = response.data.objects[0].values;
        });

    })

    .directive('barChart', function() {
        return {
            restrict: 'E',
            scope: {
                data: '='
            },

            link: function(scope, element, attrs) {

                var margin = {top: 20, right: 20, bottom: 30, left: 40},
                    width = element.parent().width() - margin.left - margin.right,
                    height = attrs.height - margin.top - margin.bottom,
                    yAxisLabel = attrs.yAxisLabel || '',
                    ticks = attrs.yAxisTicks || 10,
                    title = attrs.chartTitle || '';

                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);

                var y = d3.scale.linear()
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(ticks);

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
                    y.domain([0, d3.max(data, function(d) { return d.value; })]);

                    svg.select('.x.axis')
                        .call(xAxis);

                    svg.select('.y.axis')
                        .call(yAxis);

                    svg.selectAll(".bar")
                        .data(data)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d) { return x(d.label); })
                        .attr("width", x.rangeBand())
                        .attr("y", height)
                        .attr("height", 0)
                        .transition()
                        .attr("y", function(d) { return y(d.value); })
                        .attr("height", function(d) { return height - y(d.value); })
                });
            }
        };
    });