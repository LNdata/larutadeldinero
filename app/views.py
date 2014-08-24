from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for

from app import app
from app import db

from app.forms import FilterForm
from app.models import Aporte, Aportante, Agrupacion


@app.route("/", methods = ['GET', 'POST'])
@app.route('/<int:page>', methods = ['GET', 'POST'])
def index(page=1):
  per_page = app.config.get('PER_PAGE', 10)
  aportes = Aporte.query.paginate(page, per_page, False)
  #form = FilterForm

  return render_template('index.html', aportes=aportes)#, form=form)
#
# @app.route('/filter', methods=['GET', 'POST'])
# def filter():
#   form = FilterForm()
#   if form.validate_on_submit():
#     filter
#   return redirect(url_for('index'))


@app.route('/aportante/<document>')
def aportante(document):
    return render_template('aportante.html')
