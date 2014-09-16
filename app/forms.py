#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from flask_wtf import Form
from wtforms import SelectField
from app import db
from app.models import Aporte, Agrupacion

CICLOS =  [(x[0],x[0]) for x in db.session.query(Aporte.ciclo.distinct()).order_by(Aporte.ciclo).all()] + [(0,'Todos')]
ELECCIONES = [(x[0], x[0]) for x in db.session.query(Aporte.eleccion.distinct()).order_by(Aporte.eleccion).all()]+ [('todas','Todas')]
# To Do: agrupaciones deberia sacar solo las agrupaciones que tienen ciclos y elecciones, distrito elegidos
AGRUPACIONES = [ (agrup.id, agrup.nombre) for agrup in Agrupacion.query.all()]+ [(0,'Todas')]
DISTRITOS = [(x[0],x[0]) for x in db.session.query(Aporte.distrito.distinct()).order_by(Aporte.distrito).all()]+ [('todas','Todos')]

class FilterForm(Form):
    ciclo     = SelectField('Año Electoral'.decode('utf-8'), choices=CICLOS, coerce=int, default=0)
    eleccion  = SelectField('Elecciones', choices=ELECCIONES, default='todas')
    agrupacion = SelectField('Agrupación Politica'.decode('utf-8'), choices=AGRUPACIONES, coerce=int, default=0)
    distrito    = SelectField('Distrito', choices=DISTRITOS, default='todas')
