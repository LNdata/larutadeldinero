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
  #designaciones, contrato, autoridad, candidatura, mandato_dip, mandato_sen, imp_ganancias, imp_iva, monotributo, integrante_soc, empleador, actividad_monotributo

  def __init__(self, documento, cuit, nombre, apellido, persona, sexo, clase, lat, lon):
    self.documento  = documento
    self.cuit       = cuit
    self.nombre     = nombre
    self.apellido   = apellido
    self.persona    = persona
    self.sexo       = sexo
    self.clase      = clase
    self.lat        = lat
    self.lon        = lon

  def __repr__(self):
    return '<Aportante %r>' % self.nombre

class Agrupacion(db.Model):
  __tablename__ = 'agrupaciones'
  id = db.Column(db.Integer, primary_key=True)
  nombre = db.Column(db.String(80), unique=True)

  def __init__(self, nombre):
    self.nombre  = nombre

  def __repr__(self):
    return '<Agrupacion %r>' % self.nombre

class Aporte(db.Model):
  __tablename__ = 'aportes'
  id = db.Column(db.Integer, primary_key=True)
  ciclo = db.Column(db.Integer)
  cargo = db.Column(db.String(80))
  eleccion = db.Column(db.String(80))
  distrito = db.Column(db.String(80))
  lista = db.Column(db.String(80))
  codlista = db.Column(db.Integer)
  importe = db.Column(db.Float)
  fecha = db.Date()

  aportante_id = db.Column(db.Integer, db.ForeignKey('aportantes.id'))
  agrupacion_id = db.Column(db.Integer, db.ForeignKey('agrupaciones.id'))

  aportante = db.relationship("Aportante", backref=backref('aportes', order_by=id))
  agrupacion = db.relationship("Agrupacion", backref=backref('aportes', order_by=id))

  def __init__(self, ciclo, cargo, eleccion, distrito, importe, fecha, documento, agrupacion_name, codlista, lista):
    self.ciclo  = ciclo
    self.cargo   = cargo
    self.eleccion = eleccion
    self.distrito = distrito
    self.lista = lista
    self.codlista = codlista
    self.importe  = importe
    self.fecha    = fecha
    self.aportante  = Aportante.query.filter_by(documento=documento).first()
    self.agrupacion = Agrupacion.query.filter_by(nombre=agrupacion_name).first()

  def __repr__(self):
    return '<Aporte %r>' % self.importe
