
d3.helper = {};
 
d3.helper.tooltip_chart = function(accessor){
    return function(selection){
        var tooltipDiv;
        var bodyNode = d3.select('#charts').node();
        selection.on("mouseover", function(d, i){
            // Clean up lost tooltips
           d3.select('#charts').selectAll('div.tooltip_chart').remove();
            // Append tooltip
            tooltipDiv = d3.select('#charts').append('div').attr('class', 'tooltip_chart');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] - 10) +'px')
                .style('top', (absoluteMousePos[1] - 80)+'px')
                .style('position', 'absolute')
                .style('z-index', 1001);
            // Add text using the accessor function
            var tooltipText = accessor(d, i) || '';
            // Crop text arbitrarily
            //tooltipDiv.style('width', function(d, i){return (tooltipText.length > 80) ? '300px' : null;})
            //    .html(tooltipText);
        })
        .on('mousemove', function(d, i) {
            // Move tooltip

            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d, i){
            // Remove tooltip
           tooltipDiv.remove();
        });
 
    };
};

d3.helper.tooltip_scale = function(accessor){
    return function(selection){
        var tooltipDiv;
        var bodyNode = d3.select('#map').node();
        selection.on("mouseover", function(d, i){
            // Clean up lost tooltips
           d3.select('#map').selectAll('div.tooltip_scale').remove();
            // Append tooltip
            tooltipDiv = d3.select('#map').append('div').attr('class', 'tooltip_scale');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] - 20) +'px')
                .style('top', (absoluteMousePos[1] + -160)+'px')
                .style('position', 'relative')
                .style('z-index', 1001);
            // Add text using the accessor function
            var tooltipText = accessor(d, i) || '';

            tooltipDiv.style('width', '110px')
                .html(tooltipText);
        })
        .on('mousemove', function(d, i) {
            // Move tooltip

            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d, i){
            // Remove tooltip
           tooltipDiv.remove();
        });
 
    };
};




