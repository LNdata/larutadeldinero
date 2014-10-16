<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="../styles/main.css" />
<link rel="stylesheet" href="../styles/vendor.css" />
<script src="../scripts/vendor.js"></script>
<script src="../scripts/scripts.js"></script>
<script>$(document).ready(function(){
    $("[data-toggle=tooltip]").tooltip({ placement: 'bottom'});
});
</script>
</head>
<body>
<?php
    mysql_connect("andytowcom.domaincommysql.com", "andy", "Mpjmpj11.") or die("Error connecting to database: ".mysql_error());
     
    mysql_select_db("larutaelectoral") or die(mysql_error());

	require('qs_functions.php');

$query = qsrequest("doc");
$r=0;
$resultaportante = mysql_query("SELECT documento, nombre, apellido, sexo, clase, impuesto_iva, impuesto_ganancias, monotributo, empleador, autoridad, candidatura, contrato, designacion, mandato_diputado, mandato_senador FROM aportantes WHERE documento='$query'");
$num = mysql_numrows($resultaportante);
while ($r < $num) {
$documento=mysql_result($resultaportante,$r,"documento");
$nombre=mysql_result($resultaportante,$r,"nombre");
$apellido=mysql_result($resultaportante,$r,"apellido");
$sexo=mysql_result($resultaportante,$r,"sexo");
$clase=mysql_result($resultaportante,$r,"clase");
$impuesto_iva=mysql_result($resultaportante,$r,"impuesto_iva");
$impuesto_ganancias=mysql_result($resultaportante,$r,"impuesto_ganancias");
$monotributo=mysql_result($resultaportante,$r,"monotributo");
$empleador=mysql_result($resultaportante,$r,"empleador");
$autoridad=mysql_result($resultaportante,$r,"autoridad");
$candidatura=mysql_result($resultaportante,$r,"candidatura");
$contrato=mysql_result($resultaportante,$r,"contrato");
$designacion=mysql_result($resultaportante,$r,"designacion");
$mandato_diputado=mysql_result($resultaportante,$r,"mandato_diputado");
$mandato_senador=mysql_result($resultaportante,$r,"mandato_senador");
$edad=2014-$clase;

?>
<h3><?echo $nombre;?> <?echo $apellido;?></h3>

<table border="0" width="100%">
  <tr>
	<td width="25%" align="center">
	
		<img src="../images/icons/<?echo $sexo;?>.png">&nbsp;&nbsp;
<?
if ($edad < 2014) { ?>
		<p class="edad">(~ <?echo $edad;?> años de edad)</p>
		<?
		}?>
	</td>
	<td width="25%" align="center">
	<img src="../images/icons/imp_iva/<?echo $impuesto_iva;?>.png" data-toggle="tooltip" title="Impuesto al Valor Agregado">

		<img src="../images/icons/imp_ganancias/<?echo $impuesto_ganancias;?>.png" data-toggle="tooltip" title="Impuesto a las Ganancias">

		<img src="../images/icons/monotributo/<?echo $monotributo;?>.png" data-toggle="tooltip" title="Monotributo categoría<?echo $monotributo;?>">
		
		<img src="../images/icons/empleador/<?echo $empleador;?>.png" data-toggle="tooltip" title="Empleador">

		<img src="../images/icons/autoridad/<?echo $autoridad;?>.gif" data-toggle="tooltip" title="Autoridad partidaria">

		<img src="../images/icons/candidatura/<?echo $candidatura;?>.gif" data-toggle="tooltip" title="Candidatura">

		<img src="../images/icons/contrato/<?echo $contrato;?>.gif" data-toggle="tooltip" title="Contrato">

		<a href="http://poderofilia.andytow.com/details.php?doc=<?echo $documento;?>" target="_blank">
		
		<img src="../images/icons/designacion/<?echo $designacion;?>.gif" data-toggle="tooltip" title="Designación">
		
		</a>
		<img src="../images/icons/mandato_diputado/<?echo $mandato_diputado;?>.gif" data-toggle="tooltip" title="Mandato como Diputado">

		<img src="../images/icons/mandato_diputado/<?echo $mandato_senador;?>.gif" data-toggle="tooltip" title="Mandato como Senador">
<?
$r++;
 }
?>	
	</td>
	<td width="50%" align="center">
<?


$rr=0;
$resultagrupacion = mysql_query("SELECT ciclo, coddistrito, distrito, codlista, agrupaciones.nombre FROM (aportantes INNER JOIN aportes on aportantes.id = aportes.aportante_id) INNER JOIN agrupaciones ON aportes.agrupacion_id = agrupaciones.id WHERE (((aportantes.documento)='$query')) GROUP BY aportes.coddistrito, aportes.codlista, agrupaciones.nombre ORDER BY ciclo");
$numm = mysql_numrows($resultagrupacion);
while ($rr < $numm) {
$coddistrito = mysql_result($resultagrupacion,$rr,"coddistrito");
$codlista = mysql_result($resultagrupacion,$rr,"codlista");
$nombre_agrupacion = mysql_result($resultagrupacion,$rr,"agrupaciones.nombre");
$distrito = mysql_result($resultagrupacion,$rr,"distrito");
$ciclo = mysql_result($resultagrupacion,$rr,"ciclo");
?>

		<img src="../images/boletas/<?echo $ciclo;?>/<?echo $codlista;?>.jpg" data-toggle="tooltip" title="<?echo $nombre_agrupacion;?> <?echo $distrito?> <?echo $ciclo;?>" height="120">
  
<?
$rr++;
 }
?>
	</td>
  </tr>
</table>
<!--<dl class="dl-horizontal">

    <dt>Sexo</dt>
    <dd><img src="http://andytow.com/scripts/larutaelectoral/images/icons/{{ aportante.sexo }}.png"></dd>

<!--<dt>Documento</dt>
    <dd>{{ aportante.documento }}</dd>

    <dt>Clase</dt>
    <dd>{{ aportante.clase }}</dd>

<!--<dt>CUIT</dt>
    <dd>{{ aportante.cuit }}</dd>

</dl>
-->	
<table class="table">
    <thead>
    <th>Ciclo</th>
    <th>Elecciones</th>
    <th>Distrito</th>
    <th>Cargo</th>
    <th>Agrupación</th>
    <th>Monto</th>
    </thead>
    <tbody>
<?
$rrr=0;
$resultaportes = mysql_query("SELECT ciclo, eleccion, coddistrito, distrito, cargo, agrupaciones.nombre, SUM(importe) AS importe FROM (aportantes INNER JOIN aportes on aportantes.id = aportes.aportante_id) INNER JOIN agrupaciones ON aportes.agrupacion_id = agrupaciones.id WHERE (((aportantes.documento)='$query')) GROUP BY aportes.coddistrito, aportes.codlista, agrupaciones.nombre ORDER BY ciclo");
$nummm = mysql_numrows($resultaportes);
while ($rrr < $nummm) {
$nombre_agrupacion = mysql_result($resultaportes,$rrr,"agrupaciones.nombre");
$distrito = mysql_result($resultaportes,$rrr,"distrito");
$coddistrito = mysql_result($resultaportes,$rrr,"coddistrito");
$ciclo = mysql_result($resultaportes,$rrr,"ciclo");
$cargo = mysql_result($resultaportes,$rrr,"cargo");
$eleccion = mysql_result($resultaportes,$rrr,"eleccion");
$importe = mysql_result($resultaportes,$rrr,"importe");
$importe_pesos = number_format(($importe), 2, ',', '.');
?>
    <tr>
        <td><?echo $ciclo;?></td>
        <td><?echo $eleccion?></td>
        <td><img src="../images/escudos/<?echo $coddistrito?>.gif" height="32" align="left"><?echo $distrito;?></td>
        <td><?echo $cargo?></td>
        <td><?echo $nombre_agrupacion?></td>
        <td align="right">$<?echo $importe_pesos;?></td>
    </tr>
<?
	$rrr++;
 }
?> 
    </tbody>
</table>
<div class="text-center">
	<a href="javascript:parent.jQuery.fancybox.close();"><button type="button" class="btn btn-default">Cerrar</button></a>
</div>