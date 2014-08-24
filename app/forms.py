#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from flask_wtf import Form
from wtforms import SelectMultipleField
from app import db
from app.models import Aporte, Agrupacion

CICLOS =  [x[0] for x in db.session.query(Aporte.ciclo.distinct()).order_by(Aporte.ciclo).all()]
ELECCIONES = [x[0] for x in db.session.query(Aporte.eleccion.distinct()).order_by(Aporte.eleccion).all()]
AGRUPACIONES = Agrupacion.query.all()
DISTRITOS = [x[0] for x in db.session.query(Aporte.distrito.distinct()).order_by(Aporte.distrito).all()]

class FilterForm(Form):
    ciclo      = SelectMultipleField('Año Electoral', choices=CICLOS)
    elecciones = SelectMultipleField('Elecciones', choices=ELECCIONES)
    agrupacion = SelectMultipleField('Agrupación', choices=AGRUPACIONES)
    distrito   = SelectMultipleField('Distrito', choices=DISTRITOS)

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)

    def validate(self):
      pass
        # rv = Form.validate(self)
        # if not rv:
        #     return False
        #
        # user = User.query.filter_by(
        #     username=self.username.data).first()
        # if user is None:
        #     self.username.errors.append('Unknown username')
        #     return False
        #
        # if not user.check_password(self.password.data):
        #     self.password.errors.append('Invalid password')
        #     return False
        #
        # self.user = user
        # return True
