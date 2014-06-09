$(function () {
    cartodb.createVis('map', 'http://andytow.cartodb.com/api/v2/viz/cc3abe0a-c57b-11e3-b67f-0e10bcd91c2b/viz.json', {
        legends: false
    })
    .done(function (vis, layers) {
        $('#layer_selector').on("click", "li", function(e){
            var $li = $(this);

            var layerNumber = $li.attr('data');

            $li.siblings().removeClass('selected');
            $li.addClass('selected');

            if (layerNumber) {
                for (var i in layers[1].layers) {
                    layers[1].getSubLayer(i).hide();
                }
                layers[1].getSubLayer(layerNumber).show();
            } else {
                for (var i in layers[1].layers) {
                    layers[1].getSubLayer(i).show();
                }
            }
        });
    });
});