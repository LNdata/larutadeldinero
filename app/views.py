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

@app.route('/api/aportantes/sexo')
def aportantes_por_sexo():

  q = request.args.get('q')
  filters = parse_filters(q)

  cantidad_aportantes_por_sexo = donors_per_sex(filters),

  aportes = {
    "num_results": len(cantidad_aportantes_por_sexo),
    'objects': cantidad_aportantes_por_sexo
  }

  return jsonify( aportes )

@app.route('/api/treemap')
def data_for_treemap():

  with open('data/treemap_elecciones.json','r') as f:
    treemap_data = eval(f.read())

  return jsonify(treemap_data)

@app.route('/api/map')
def data_for_map():
  with open('data/map.json','r') as f:
    treemap_data = eval(f.read())

  return jsonify(treemap_data)
