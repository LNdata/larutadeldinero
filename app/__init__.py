from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy
import flask.ext.restless

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)

from app.models import *
from app import views

# HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

db.create_all()

# Create the Flask-Restless API manager.
manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well.
manager.create_api(Aportante, methods=['GET', 'POST'], allow_functions=True)
manager.create_api(Aporte, methods=['GET'], allow_functions=True)
manager.create_api(Agrupacion, methods=['GET'])
