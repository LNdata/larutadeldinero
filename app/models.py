#!/usr/bin/env python
# -*- coding: UTF-8 -*-

from app import db
from app import app

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, backref

class Aportante(db.Model):
  __tablename__ = 'aportantes'
  id = db.Column(db.Integer, primary_key=True)
  documento = db.Column(db.String(30), unique=True)
  cuit = db.Column(db.String(80))
  nombre = db.Column(db.String(80))
  apellido = db.Column(db.String(80))
  persona = db.Column(db.String(50))
  sexo = db.Column(db.Enum('F', 'M', name='sexo_types'))
  clase = db.Column(db.Integer)
  lat = db.Column(db.String(50))
  lon = db.Column(db.String(50))
  designacion   = db.Column(db.Boolean) #si figura en el boletin oficial
  contrato      = db.Column(db.Boolean) # si tiene algun contrato
  autoridad     = db.Column(db.Boolean)
  candidatura   = db.Column(db.Boolean)
  mandato_diputado   = db.Column(db.Boolean)
  mandato_senador    = db.Column(db.Boolean)

  tipo_inscripcion = db.Enum('NI', 'N', 'AC', 'S', 'EX', 'NA', 'XN', 'AN', 'NC', name='inscripcion_types') #'NI', 'N' = No Inscripto - 'AC', 'S' = Activo - 'EX' = Exento - 'NA' = No alcanzado  - 'XN' = Exento no alcanzado - 'AN' = Activo no alcanzado - 'NC' = No corresponde , por defecto NC

  impuesto_ganancias = db.Column(tipo_inscripcion) # Tipo de inscripción en el Impuesto a las Ganancias
  impuesto_iva = db.Column(tipo_inscripcion) # Tipo de inscripción en el Impuesto al Valor Agregado
  monotributo = db.Column(tipo_inscripcion)  # Tipo de inscripción en el Monotributo

  integrante_sociedades = db.Column(db.Boolean) # Es integrante de alguna sociedad?
  empleador = db.Column(db.Boolean) # Es empleador?
  actividad_monotributo = db.Column(db.String(50))

  def __init__(self, documento, cuit, nombre, apellido, persona, sexo, clase, lat, lon, designacion, contrato, autoridad, candidatura, mandato_diputado, mandato_senador, impuesto_ganancias, impuesto_iva, monotributo, integrante_sociedades, empleador, actividad_monotributo):
    self.documento  = documento
    self.cuit       = cuit
    self.nombre     = nombre
    self.apellido   = apellido
    self.persona    = persona
    self.sexo       = sexo
    self.clase      = clase
    self.lat        = lat
    self.lon        = lon

    self.designacion   = designacion
    self.contrato      = contrato
    self.autoridad     = autoridad
    self.candidatura   = candidatura
    self.mandato_diputado   = mandato_diputado
    self.mandato_senador    = mandato_senador
    self.impuesto_ganancias = impuesto_ganancias
    self.impuesto_iva = impuesto_iva
    self.monotributo = monotributo
    self.integrante_sociedades = integrante_sociedades
    self.empleador = empleador
    self.actividad_monotributo = actividad_monotributo


  def __repr__(self):
    return ' '.join[self.nombre, self.apellido]

class Agrupacion(db.Model):
  __tablename__ = 'agrupaciones'
  id = db.Column(db.Integer, primary_key=True)
  nombre = db.Column(db.String(80), unique=True)

  def __init__(self, nombre):
    self.nombre  = nombre

  def __repr__(self):
    return self.nombre

class Aporte(db.Model):
  __tablename__ = 'aportes'
  id = db.Column(db.Integer, primary_key=True)
  ciclo = db.Column(db.Integer)
  cargo = db.Column(db.String(80))
  eleccion = db.Column(db.String(80))
  distrito = db.Column(db.String(80))
  lista = db.Column(db.String(80))
  codlista = db.Column(db.String(20))
  importe = db.Column(db.Float)
  fecha = db.Date()
  color        = db.Column(db.String(50))
  grupo_edad   = db.Column(db.String(80))
  grupo_aporte = db.Column(db.String(80))

  aportante_id = db.Column(db.Integer, db.ForeignKey('aportantes.id'))
  agrupacion_id = db.Column(db.Integer, db.ForeignKey('agrupaciones.id'))

  aportante = db.relationship("Aportante", backref=backref('aportes', order_by=id))
  agrupacion = db.relationship("Agrupacion", backref=backref('aportes', order_by=id))

  def __init__(self, ciclo, cargo, eleccion, distrito, importe, fecha, documento, agrupacion_name, codlista, lista, color, grupo_edad, grupo_aporte):
    self.ciclo  = ciclo
    self.cargo   = cargo
    self.eleccion = eleccion
    self.distrito = distrito
    self.lista = lista
    self.codlista = codlista
    self.importe  = importe
    self.fecha    = fecha
    self.color        = color
    self.grupo_edad   = grupo_edad
    self.grupo_aporte = grupo_aporte # categoria de importe, calculado por andy tow
    self.aportante  = Aportante.query.filter_by(documento=documento).first()
    self.agrupacion = Agrupacion.query.filter_by(nombre=agrupacion_name).first()

  def __repr__(self):
    return '<Aporte documento %s, importe %s>' % (self.aportante.documento, self.importe)
