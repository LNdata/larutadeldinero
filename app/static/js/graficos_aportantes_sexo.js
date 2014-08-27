
      google.load("visualization", "1", {packages:["corechart"]});
      google.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['CUENTADESEXO','F','M'],
          ['', cantidad_aportantes_F, cantidad_aportantes_M],
        ]);

        var options = {
          legend: {position: 'none'},
          fontName: ['Lucida Sans Unicode'],
          colors: ['#81BEF7','#08298A']
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('_chart_div_SEXO'));

        chart.draw(data, options);
      }
