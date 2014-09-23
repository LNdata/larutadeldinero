#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from flask import request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify

from app import app
from app import db

from app.forms import FilterForm
from app.helpers import *
from app.models import Aporte, Aportante, Agrupacion

from sqlalchemy import func

# EndPoint treemap
# EndPoint map data

@app.route("/", methods = ['GET', 'POST'])
@app.route("/viz/<viz>", methods = ['GET', 'POST'])
def index(viz='treemap'):
  params = request.args.to_dict()
  page = request.args.get('page', 1, type=int)

  per_page = app.config.get('PER_PAGE', 10)

  # TO DO - REFACTORING
  form = FilterForm(request.form, params)
  filters = get_filters(form.data)

  aportes = get_donations(filters)
  aportes_paginados = aportes.paginate(page, per_page, False)

  if (viz == 'mapa'):
    query = "select * from larutaelectoral where elecciones='GENERALES'"
    return render_template('mapa_b.html', aportes=aportes_paginados, form=form, query=query)

  elif (viz == 'graficos'):
    return render_template('graficos_b.html', \
            aportes=aportes_paginados, form=form,\
            cantidad_aportantes_por_sexo=donors_per_sex(filters),\
            cantidad_aportantes_por_edad=donors_per_age(filters), \
            cantidad_aportantes_por_agrupaciones=donors_per_party(filters), \
            suma_aportes_por_sexo=import_per_sex(filters), \
            suma_aportes_por_edad=import_per_age(filters), \
            suma_aportes_por_agrupaciones=import_per_party(filters) \
            )

  elif (viz == 'tabla'):
    return render_template('tabla_datos.html', aportes=aportes_paginados, form=form)

  else:
    return render_template('treemap_b.html', aportes=aportes_paginados, form=form)

@app.route('/aportante/<documento>')
def aportante(documento):
    aportante = Aportante.query.filter_by(documento=documento).first_or_404()
    return render_template('aportante.html', aportante=aportante)

@app.route('/about')
def about():
  return render_template('sitio.html')

@app.route('/faq')
def faq():
  return render_template('faq.html')

@app.route('/team')
def team():
  return render_template('team.html')
