#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from flask import request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify

from app import app
from app import db

# from app.forms import FilterForm
from app.helpers import *
from app.models import Aporte, Aportante, Agrupacion

from sqlalchemy import func

from flask.ext.cache import Cache

cache = Cache(app=None, with_jinja2_ext=True, config={'CACHE_TYPE': 'filesystem', 'CACHE_DIR': 'cache'})
cache.init_app(app)

def make_cache_key(*args, **kwargs):
    path = request.path
    args = str(hash(frozenset(request.args.items())))
    # lang = get_locale()
    return (path + args).encode('utf-8')


@app.route('/')
@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def index():
  return render_template('index.html')

# Consultas -----------------------

@app.route('/api/aportantes/sexo')
@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def aportantes_por_sexo():

  filters = parse_filters(request.args.get('q'))

  cantidad_aportantes_por_sexo = donors_per_sex(filters),

  aportantes = {
    "num_results": len(cantidad_aportantes_por_sexo),
    'objects': cantidad_aportantes_por_sexo
  }

  return jsonify( aportantes )

@app.route('/api/aportantes/edad')
@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def aportantes_por_edad():

  filters = parse_filters(request.args.get('q'))

  cantidad_aportantes_por_edad = donors_per_age(filters)

  aportantes = {
    "num_results": len(cantidad_aportantes_por_edad),
    'objects': cantidad_aportantes_por_edad
  }

  return jsonify( aportantes )


@app.route('/api/aportantes/agrupacion')
@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def aportantes_por_agrupacion():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportantes_por_agrupacion = donors_per_party(filters)

  aportantes = {
    "num_results": len(cantidad_aportantes_por_agrupacion),
    'objects': cantidad_aportantes_por_agrupacion
  }

  return jsonify( aportantes )


@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def aportes_por_sexo():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportes_por_sexo = amount_per_sex(filters)

  aportes = {
    "num_results": len(cantidad_aportes_por_sexo),
    'objects': cantidad_aportes_por_sexo
  }

  return jsonify( aportes )


@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def aportes_por_edad():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportes_por_edad = amount_per_age(filters)

  aportes = {
    "num_results": len(cantidad_aportes_por_edad),
    'objects': cantidad_aportes_por_edad
  }

  return jsonify( aportes )


@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def aportes_por_agrupacion():
  filters = parse_filters(request.args.get('q'))

  cantidad_aportes_por_agrupacion = amount_per_party(filters)

  aportes = {
    "num_results": len(cantidad_aportes_por_agrupacion),
    'objects': cantidad_aportes_por_agrupacion
  }

  return jsonify( aportes )

@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def aportes_stats():

  filters = parse_filters(request.args.get('q'))
  aportes =  filter_aportes(db.session.query(func.avg(Aporte.importe), func.sum(Aporte.importe)).join(Aportante), filters)

  aportes_stats = aportes.all()[0]

  aportes = {
    "avg_importe" : int(aportes_stats[0]) if aportes_stats[0] else aportes_stats[0],
    "sum_importe" : int(aportes_stats[1]) if aportes_stats[0] else aportes_stats[1]
  }

  return jsonify( aportes )

# Visualizaciones ----------------------------------

@app.route('/api/treemap')
@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def data_for_treemap():
  treemap_data = get_treemap()
  return jsonify(treemap_data)

@app.route('/api/map')
@cache.cached(timeout=60*10, key_prefix=make_cache_key)
def data_for_map():

# ?q={"filters":[{"name":"age","op":"eq","val":"22"}]}
# ?q={"filters":[{"name":"age","op":"in","val":"22"}]}
# ?q={"filters":[{"name":"age","op":"has","val":"22"}]}

  filters = parse_filters(request.args.get('q'))

  # eq e in sobre todos los campos del aportante
  aportes = filter_aportes(db.session.query(Aportante.documento, Aportante.lat, Aportante.lon, func.sum(Aporte.importe), Aporte.color ).join(Aporte).filter(Aportante.lon  != "", Aportante.lat != ""), filters)


  aportes = aportes.group_by(Aportante.documento).distinct().all()
  
  results = {
        "key": "Aportantes",
        "num_results": len(aportes),
        "values": [ { "documento": aporte[0], "latitud": aporte[1], "longitud": aporte[2], "monto": aporte[3], "color": aporte[4]} for aporte in aportes]
        }

  return jsonify(results)
