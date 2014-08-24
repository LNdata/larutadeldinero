from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)

# HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

#import ruta.views
#import ruta.models

from app import views, models

# Build the database:
# This will create the database file using SQLAlchemy
#db.create_all()
