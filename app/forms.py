#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from flask_wtf import Form
from wtforms import SelectMultipleField
from app import db
from app.models import Aporte, Agrupacion

CICLOS =  [(x[0],x[0]) for x in db.session.query(Aporte.ciclo.distinct()).order_by(Aporte.ciclo).all()]
ELECCIONES = [(x[0], x[0]) for x in db.session.query(Aporte.eleccion.distinct()).order_by(Aporte.eleccion).all()]
AGRUPACIONES = [ (agrup.id, agrup.nombre) for agrup in Agrupacion.query.all()]
DISTRITOS = [(x[0],x[0]) for x in db.session.query(Aporte.distrito.distinct()).order_by(Aporte.distrito).all()]

class FilterForm(Form):
    ciclo     = SelectMultipleField('Año Electoral'.decode('utf-8'), choices=CICLOS, coerce=int)
    eleccion  = SelectMultipleField('Elecciones', choices=ELECCIONES)
    agrupacion = SelectMultipleField('Agrupación Politica'.decode('utf-8'), choices=AGRUPACIONES)
    distrito    = SelectMultipleField('Distrito', choices=DISTRITOS)

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)

    def validate(self):
        rv = Form.validate(self)
        if not rv:
            return False

        # if not (self.ciclo in CICLOS or self.eleccion in ELECCIONES or self.agrupacion in AGRUPACIONES or self.distrito in DISTRITOS):
        #   return False

        return True
