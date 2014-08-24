var partidos = [
    ["FRENTE PARA LA VICTORIA"],
    ["FRENTE RENOVADOR","UNION POR CORDOBA","UNIDOS POR LA LIBERTAD Y EL TRABAJO"],
    ["FRENTE PROGRESISTA CIVICO Y SOCIAL","UNEN", "UNION CIVICA RADICAL"],
    ["UNION PRO","UNION PRO SANTA FE FEDERAL"]
];

$(function() {
    var URL = "https://docs.google.com/spreadsheets/d/1e21bVCjchhMoUfwxosVDGnzGpe5CyuSlE7FYVJ27pxo/pubhtml"
    Tabletop.init( { key: URL, simpleSheet: true, callback: function showInfo(data) {
        var tableOptions = {"data": data, "pagination": 50, "tableDiv": "#fullTable", "filterDiv": "#fullTableFilter"};
        Sheetsee.makeTable(tableOptions);
        Sheetsee.initiateTableFilter(tableOptions);

        $('#layer_selector').on("click", "li", function (e) {
            var $li = $(this);

            var layerNumber = $li.attr('data');

            var filteredList = [];
            if (layerNumber) {
                var partido = partidos[layerNumber];
                tableOptions.data.forEach(function (object) {
                    for(var i in partido) {
                        if (object.agrupacion.toLowerCase() == partido[i].toLocaleLowerCase()) {
                            filteredList.push(object);
                            break;
                        }
                    }
                });

                Sheetsee.makeTable(tableOptions, filteredList);
            } else {
                Sheetsee.makeTable(tableOptions);
            }
        });
    }});
});