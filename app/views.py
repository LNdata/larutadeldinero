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
def index():
  params = request.args.to_dict()
  page = request.args.get('page', 1, type=int)

  per_page = app.config.get('PER_PAGE', 10)

  form = FilterForm()
  if form.validate():
    aportes = get_aportes_filtrados(form.data).paginate(page, per_page, False)
  else:
    aportes = get_aportes_filtrados(params).paginate(page, per_page, False)

  return render_template('index.html', aportes=aportes, form=form)


@app.route('/aportante/<document>')
def aportante(document):
    aportante = Aportante.query.filter_by(documento=documento).first_or_404()
    return render_template('aportante.html', aportante=aportante)

def get_aportes_filtrados(params):
  aportes = Aporte.query
  for filtro in params.keys():
    if filtro == 'ciclo':
      aportes = aportes.filter_by(ciclo = params[filtro])
    elif filtro == 'eleccion':
      aportes = aportes.filter_by(eleccion = params[filtro])
    elif filtro == 'agrupacion':
      aportes = aportes.filter_by(agrupacion = params[filtro])
    elif filtro == 'distrito':
      aportes = aportes.filter_by(distrito = params[filtro])
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
