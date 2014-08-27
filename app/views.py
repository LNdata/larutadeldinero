#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify

from app import app
from app import db

from app.forms import FilterForm
from app.models import Aporte, Aportante, Agrupacion

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
    cantidad_aportantes_por_sexo = aportantes_por_sexo(params)
    return render_template('graficos_b.html', aportes=aportes_paginados, form=form, cantidad_aportantes_por_sexo=cantidad_aportantes_por_sexo)
  else:
    return render_template('treemap_b.html', aportes=aportes_paginados, form=form) # los aportantes para graficos
    #para boletas = get_boletas_filtradas(aportes)

@app.route('/aportante/<documento>')
def aportante(documento):
    aportante = Aportante.query.filter_by(documento=documento).first_or_404()
    return render_template('aportante.html', aportante=aportante)


# devolver sexo de aportantes para grafico
def aportantes_por_sexo(filtros):
  # ciclo, agrupacion, eleccion, distrito
  #Aportante.query.count(Aportante.sexo)
  # SELECT aportantes.SEXO, COUNT(aportantes.SEXO) AS CuentaDeSEXO FROM (SELECT aportantes.SEXO, aportes.DOCUMENTO
  # FROM aportantes INNER JOIN aportes ON aportantes.DOCUMENTO = aportes.DOCUMENTO
  # WHERE (((aportes.CICLO)=2013) AND ((aportes.CARGO)="Diputados") AND ((aportes.ELECCIONES)="GENERALES") AND ((aportes.DISTRITO)="BUENOS AIRES") AND ((aportantes.PERSONA)="FISICA"))
  # GROUP BY aportantes.SEXO, aportes.DOCUMENTO) GROUP BY aportantes.SEXO;

  cantidad_aportantes_por_sexo = { 'F': 775, 'M': 1722 } # {'F': N, 'M': N}
  return cantidad_aportantes_por_sexo


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

@app.route('/api/aportes', methods=['GET'])
def get_aportes():


  aportes_json = { 'aportes': [] }

  aportes = get_aportes_filtrados(request.args.to_dict()).all()

  #aportes = aportes.all()
  #aportes = Aporte.query.filter_by(ciclo=filtros['ciclo']).all()

  for aporte in aportes:
    try:
      aportes_json['aportes'].append({ 'ciclo':  aporte.ciclo, 'cargo': aporte.cargo, 'eleccion': aporte.eleccion, 'distrito': aporte.distrito, 'lista': aporte.lista, 'importe': aporte.importe, 'aportante': aporte.aportante.nombre, 'agrupacion': aporte.agrupacion.nombre})
    except:
      # Log this error
      continue

  return jsonify( aportes_json )
