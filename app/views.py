#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify

from app import app
from app import db

from app.forms import FilterForm
from app.models import Aporte, Aportante, Agrupacion

from sqlalchemy import func

@app.route("/", methods = ['GET', 'POST'])
@app.route("/viz/<viz>", methods = ['GET', 'POST'])
def index(viz='treemap'):
  params = request.args.to_dict()
  page = request.args.get('page', 1, type=int)

  per_page = app.config.get('PER_PAGE', 10)

  # TO DO - REFACTORING
  form = FilterForm(request.form, params)

  aportes = get_aportes_filtrados(form.data)
  aportes_paginados = aportes.paginate(page, per_page, False)

  if (viz == 'mapa'):
    #http://andytow.cartodb.com/api/v2/sql?q=SELECT * FROM public.larutaelectoral
    query = "select * from larutaelectoral where elecciones='GENERALES'"
    return render_template('mapa_b.html', aportes=aportes_paginados, form=form, query=query)
  elif (viz == 'graficos'):
    return render_template('graficos_b.html', aportes=aportes_paginados, form=form, cantidad_aportantes_por_sexo=aportantes_por_sexo(params), cantidad_aportantes_por_agrupaciones=aportantes_por_agrupaciones(params))
  elif (viz == 'tabla'):
    return render_template('tabla_datos.html', aportes=aportes_paginados, form=form)
  else:
    return render_template('treemap_b.html', aportes=aportes_paginados, form=form) # los aportantes para graficos
    #para boletas = get_boletas_filtradas(aportes)

@app.route('/aportante/<documento>')
def aportante(documento):
    aportante = Aportante.query.filter_by(documento=documento).first_or_404()
    return render_template('aportante.html', aportante=aportante)


# devolver sexo de aportantes para grafico
def aportantes_por_sexo(filtros):
  # filtros = ciclo, agrupacion, eleccion, distrito
  #aportantes_filtrados = get_aportantes_filtrados(filtros)

  amount_by_sexo_f = Aportante.query.filter(Aportante.sexo == 'F').count()
  amount_by_sexo_m = Aportante.query.filter(Aportante.sexo == 'M').count()

  #session.query(func.count(Aportante.id)).group_by(Aportante.sexo)

  return [
      {
        "label": "Femenino",
        "value" : amount_by_sexo_f
      } ,
      {
        "label": "Masculino",
        "value" : amount_by_sexo_m
      } ]

# devuelve grupos de edad
def aportantes_por_edad(filtros):
  # filtros = ciclo, agrupacion, eleccion, distrito
  # SELECT aportes.GRUPOEDAD, COUNT(aportes.GRUPOEDAD) AS CuentaDeGRUPOEDAD FROM (SELECT aportes.GRUPOEDAD, aportantes.DOCUMENTO
  # FROM aportes INNER JOIN aportantes ON aportes.DOCUMENTO = aportantes.DOCUMENTO
  # WHERE (((aportes.CICLO)=2013) AND ((aportes.CARGO)="Diputados") AND ((aportes.ELECCIONES)="GENERALES") AND ((aportes.DISTRITO)="BUENOS AIRES"))
  # GROUP BY aportes.GRUPOEDAD, aportantes.DOCUMENTO
  # HAVING ((Not (aportes.GRUPOEDAD) Is Null))) GROUP BY aportes.GRUPOEDAD;
  pass

def aportantes_por_agrupaciones(filtros):
  # cantidad de aportantes por cada agrupacon
  # filtros = ciclo, agrupacion, eleccion, distrito

  #query = db.session.query(func.count(Aporte.aportante), Aporte.agrupacion.nombre).group_by(Aporte.agrupacion_id)

  query = "select count(aportante_id), agrupaciones.nombre from aportes inner join agrupaciones on agrupacion_id = agrupaciones.id group by agrupaciones.nombre"
  values = db.session.execute(query).fetchall()

  print values
  
  return [ {
    'key'    : 'Agrupaciones',
    'values' : [ {"label": y, "value": int(x) } for (x,y) in values ]
    }
  ]

  # return [ {
  #  'key': 'Agrupaciones',
  #  'values': [
  #    {
  #      "label": "Frente para la victoria",
  #      "value" : 300
  #    } ,
  #    {
  #      "label": "Frente Renovador",
  #      "value" : 200
  #    },
  #    {
  #      "label": "Unidos pora la libertad y el trabajo",
  #      "value" : 300
  #    } ,
  #    {
  #      "label": "Nuevo Buenos Aires",
  #      "value" : 300
  #    }
  #    ]
  #  }]

def get_boletas_filtradas(aportes):
  boletas = [] # { codlista: NN, ciclo: NNNN}
  boletas = [{'codlista': x.codlista, 'ciclo': x.ciclo} for x in aportes.distinct(Aporte.codlista)]
  return boletas

def get_aportes_filtrados(params):
  aportes = Aporte.query
  for filtro in params.keys():
    if filtro == 'ciclo':
      if params[filtro] != 0:
        aportes = aportes.filter_by(ciclo = params[filtro])
    elif filtro == 'eleccion':
      if params[filtro] != 'todas':
        aportes = aportes.filter_by(eleccion = params[filtro].upper())
    elif filtro == 'agrupacion':
      if params[filtro] != 0:
        aportes = Agrupacion.query.filter_by(id=params[filtro]).first().aportes
    elif filtro == 'distrito':
      if params[filtro] != 'todas':
        aportes = aportes.filter_by(distrito = params[filtro].upper())
  return aportes

def get_aportantes_filtrados(params):
  aportes_filtrados = get_aportes_filtrados(params)
  return [aporte.aportante for aporte in aportes_filtrados]

@app.route('/about')
def about():
  return render_template('sitio.html')

@app.route('/faq')
def faq():
  return render_template('faq.html')

@app.route('/team')
def team():
  return render_template('team.html')


# ######## API

@app.route('/api/aportes', methods=['GET'])
def get_aportes():
  aportes_json = { 'aportes': [] }
  aportes = get_aportes_filtrados(request.args.to_dict()).all()

  for aporte in aportes:
    try:
      aportes_json['aportes'].append({ 'ciclo':  aporte.ciclo, 'cargo': aporte.cargo, 'eleccion': aporte.eleccion, 'distrito': aporte.distrito, 'lista': aporte.lista, 'importe': aporte.importe, 'aportante': aporte.aportante.nombre, 'agrupacion': aporte.agrupacion.nombre})
    except:
      # Log this error
      continue

  return jsonify( aportes_json )
