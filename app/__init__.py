from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)

from app import models
from app import views

# HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404
