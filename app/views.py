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

@app.route('/')
def index():
  return render_template('index.html')

# Consultas -----------------------

@app.route('/api/aportantes/sexo')
def aportantes_por_sexo():

  filters = parse_filters(request.args.get('q'))

  cantidad_aportantes_por_sexo = donors_per_sex(filters),

  aportantes = {
    "num_results": len(cantidad_aportantes_por_sexo),
    'objects': cantidad_aportantes_por_sexo
  }

  return jsonify( aportantes )

@app.route('/api/aportantes/edad')
def aportantes_por_edad():

  filters = parse_filters(request.args.get('q'))

  cantidad_aportantes_por_edad = donors_per_age(filters)

  aportantes = {
    "num_results": len(cantidad_aportantes_por_edad),
    'objects': cantidad_aportantes_por_edad
  }

  return jsonify( aportantes )

@app.route('/api/aportantes/agrupacion')
def aportantes_por_agrupacion():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportantes_por_agrupacion = donors_per_party(filters)

  aportantes = {
    "num_results": len(cantidad_aportantes_por_agrupacion),
    'objects': cantidad_aportantes_por_agrupacion
  }

  return jsonify( aportantes )

def aportes_por_sexo():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportes_por_sexo = amount_per_sex(filters)

  aportes = {
    "num_results": len(cantidad_aportes_por_sexo),
    'objects': cantidad_aportes_por_sexo
  }

  return jsonify( aportes )

def aportes_por_edad():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportes_por_edad = amount_per_age(filters)

  aportes = {
    "num_results": len(cantidad_aportes_por_edad),
    'objects': cantidad_aportes_por_edad
  }

  return jsonify( aportes )

def aportes_por_agrupacion():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportes_por_agrupacion = amount_per_party(filters)

  aportes = {
    "num_results": len(cantidad_aportes_por_agrupacion),
    'objects': cantidad_aportes_por_agrupacion
  }

  return jsonify( aportes )

# Visualizaciones ----------------------------------

@app.route('/api/treemap')
def data_for_treemap():
  treemap_data = get_treemap()
  return jsonify(treemap_data)

@app.route('/api/map')
def data_for_map():

# ?q={"filters":[{"name":"age","op":"eq","val":"22"}]}
# ?q={"filters":[{"name":"age","op":"in","val":"22"}]}
# ?q={"filters":[{"name":"age","op":"has","val":"22"}]}

  filters = parse_filters(request.args.get('q'))

  # eq e in sobre todos los campos del aportante
  aportes = db.session.query(Aportante.documento, Aportante.lat, Aportante.lon, func.sum(Aporte.importe), Aporte.color ).join(Aportante.aportes).filter(Aportante.lon  != "", Aportante.lat != "")

  for filter in filters:
    if filter["op"] == "eq":
      field = "Aporte.%s" % filter["name"]
      aportes = aportes.filter(field == filter["val"])
    elif filter["op"] == "in":
      for val in filter["val"]:
        field = "Aporte.%s" % filter["name"]
        aportes = aportes.filter(field == val)

  aportes = aportes.group_by(Aportante.documento).distinct().all()

  results = {
        "key": "Aportantes",
        "values": [ { "documento": aporte[0], "latitud": aporte[1], "longitud": aporte[2], "monto": aporte[3], "color": aporte[4]} for aporte in aportes]
        }

  return jsonify(results)
