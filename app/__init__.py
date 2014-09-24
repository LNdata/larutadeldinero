from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy
import flask.ext.restless

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)

from app.models import *
from app.views import *

db.create_all()

# Create the Flask-Restless API manager.
manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Aportante, methods=['GET', 'POST'], allow_functions=True)
manager.create_api(Aporte, methods=['GET'], allow_functions=True)
manager.create_api(Agrupacion, methods=['GET'], include_columns=['id', 'nombre'], max_results_per_page=-1)

# datos para visualizaciones
app.add_url_rule('/api/treemap', 'treemap', data_for_treemap)
app.add_url_rule('/api/map', 'map', data_for_map)

# consultas
app.add_url_rule('/api/aportantes/sexo', 'aportantes_por_sexo', aportantes_por_sexo)

# info sobre el api
app.add_url_rule('/', 'index', index)
