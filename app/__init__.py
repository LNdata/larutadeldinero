from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)

from app import models

# This will create the database file using SQLAlchemy
db.create_all()
db.session.commit()

# HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

from app import views
