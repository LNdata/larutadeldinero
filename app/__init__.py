#!/usr/bin/env python
# -*- coding: UTF-8 -*-
from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy
import flask.ext.restless

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)

from app.models import *
from app.views import *
from app.helpers import pre_get_many_aportantes_mapa

db.create_all()

# Create the Flask-Restless API manager.
manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Aportante, methods=['GET', 'POST'], allow_functions=True)

# Para el mapa necesitamos sólo algunos datos
manager.create_api(Aportante, collection_name='mapa',
                              methods=['GET'],
                              include_columns=['documento','lat','lon', 'aportes', 'aportes.color', 'aportes.importe'],
                              allow_functions=True,
                              max_results_per_page=-1,
                              postprocessors = {'GET_MANY': [pre_get_many_aportantes_mapa] }
                  )

manager.create_api(Aporte, methods=['GET'], allow_functions=True)
manager.create_api(Agrupacion, methods=['GET'], include_columns=['id', 'nombre'], max_results_per_page=-1)

# datos para visualizaciones
app.add_url_rule('/api/treemap', 'treemap', data_for_treemap)
app.add_url_rule('/api/map', 'map', data_for_map)

# consultas
app.add_url_rule('/api/aportantes/sexo', 'aportantes_por_sexo', aportantes_por_sexo)
app.add_url_rule('/api/aportantes/edad', 'aportantes_por_edad', aportantes_por_edad)
app.add_url_rule('/api/aportantes/agrupacion', 'aportantes_por_agrupacion', aportantes_por_agrupacion)

app.add_url_rule('/api/aportes/sexo', 'aportes_por_sexo', aportes_por_sexo)
app.add_url_rule('/api/aportes/edad', 'aportes_por_edad', aportes_por_edad)
app.add_url_rule('/api/aportes/agrupacion', 'aportes_por_agrupacion', aportes_por_agrupacion)

# info sobre el api
app.add_url_rule('/', 'index', index)
