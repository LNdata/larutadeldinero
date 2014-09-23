from app import db
from app.models import Aporte, Aportante, Agrupacion
from sqlalchemy import func

from flask.ext.script import Command, Manager, Option

import csv
import json
from time import gmtime, strftime

class GenerateJson(Command):
  "Generate JSON"

  def __init__(self, default_name='map'):
      self.default_name=default_name

  def get_options(self):
      return [
          Option('-n', '--name', dest='name', default=self.default_name),
      ]

  def generate_map_json(self):
    aportes = db.session.query(Aportante.documento, Aportante.lat, Aportante.lon, func.sum(Aporte.importe) ).join(Aportante.aportes).filter(Aportante.lon  != "", Aportante.lat != "").group_by(Aportante.documento).distinct().all()

    results = {
          "key": "Aportes",
          "values": [ { "documento": aporte[0], "latitud": aporte[1], "longitud": aporte[2], "monto": aporte[3]} for aporte in aportes]
          }

    with open('data/map.json','w') as outfile:
      json.dump(results, outfile)

  def generate_treemap_json(self):
    results = {"name": "Ciclos", "children": []}

    query_ciclos = "SELECT DISTINCT CICLO FROM aportes"
    ciclos = [x[0] for x in query(query_ciclos)]
    # CICLO ------
    for ciclo in ciclos:
      nuevo_ciclo = {"name": ciclo, "children": []}
      query_elecciones = "SELECT DISTINCT ELECCIONES as eleccion FROM aportes WHERE CICLO = '%s'" % ciclo
      elecciones = [x[0] for x in query(query_elecciones)]
      # ELECCION ------
      for eleccion in elecciones:
        nueva_eleccion = {"name": eleccion, "children": []}
        query_distritos = "SELECT DISTINCT DISTRITO FROM aportes WHERE CICLO = '%s' AND ELECCIONES = '%s'" % (ciclo, eleccion)
        distritos = [x[0] for x in query(query_distritos)]
        # DISTRITO ------
        for distrito in distritos:
          nuevo_distrito = get_distrito(ciclo, eleccion, distrito)
          nueva_eleccion["children"].append(nuevo_distrito)
        nuevo_ciclo["children"].append(nueva_eleccion)
        # AGRUPACION ------
          # IMPORTE ------
      print nuevo_ciclo
      results["children"].append(nuevo_ciclo)

    conn.close()

    with open('data/treemap_elecciones.json','w') as outfile:
      json.dump(results, outfile)

  def run(self, name):
    self.generate_map_json()


class ImportData(Command):
  "Import data into db"

  def __init__(self, default_name='all'):
      self.default_name=default_name

  def get_options(self):
      return [
          Option('-n', '--name', dest='name', default=self.default_name),
      ]

  def import_agrupaciones(self):
      with open('data/agrupaciones.txt','r') as f:
        data = eval(f.read())
        for name in data:
          agrupacion = Agrupacion(nombre=name)
          db.session.add(agrupacion)
        db.session.commit()

  def import_aportantes(self):
      #with open('data/aportantes.csv','r') as f:\
      with open('data/aportantes.csv', 'r') as csvfile:
        #lines = f.readlines()[1:]
        lines = csv.reader(csvfile, delimiter=',', quotechar='|', skipinitialspace=True)
        for data in lines:
          if data[0] == 'DOCUMENTO':
            continue
          print data
          documento = data[0].split('.')[0]
          cuit = data[1]
          nombre = data[2]
          apellido = data[3]
          persona = data[4]
          if data[5] in ['M', 'F']:
            sexo = data[5]

          clase = int(float(data[6])) if data[6] else 0

          designacion = True if data[7] else False
          contrato = True if data[8] else False
          autoridad = True if data[9] else False
          candidatura = True if data[10] else False
          mandato_diputado = True if data[11] else False
          mandato_senador = True if data[12] else False

          impuesto_ganancias = data[13] if data[13] else 'NC'
          impuesto_iva = data[14] if data[14] else 'NC'
          if data[15] in ['NI', 'N', 'AC', 'S', 'EX', 'NA', 'XN', 'AN', 'NC']:
            monotributo = data[15]
          else:
            monotributo = 'NC'

          integrante_sociedades = True if data[16] else False
          empleador = True if data[17] else False

          actividad_monotributo = data[18]

          lat = data[19]
          lon = data[20]

          aportante = Aportante(documento, cuit, nombre, apellido, persona, sexo, clase, lat, lon, designacion, contrato, autoridad, candidatura, mandato_diputado, mandato_senador, impuesto_ganancias, impuesto_iva, monotributo, integrante_sociedades, empleador, actividad_monotributo)

          db.session.add(aportante)

        db.session.commit()

  def import_aportes(self):
      with open('data/aportes.csv','r') as f:
        data = f.readlines()[1:]
        for line in data:
          data = line.split(',')
          try:
            ciclo = int(float(data[0]))
            cargo = data[1]
            eleccion = data[2]
            coddistrito = data[3]
            distrito = data[4]
            agrupacion_nombre = data[5]
            lista = data[6]
            documento = data[7].split('.')[0]
            cuit = data[8]
            fecha = strftime(data[9], gmtime()) #datetime.datetime.strftime(data[10], gmtime()).date() #'6/8/2013 00:00:00'
            importe = float(data[10])
            codlista = data[11]
            color = data[12]
            grupo_edad = data[13]
            grupo_aporte = data[14]
          except Exception as exception:
            print exception
            continue

          aporte = Aporte(ciclo, cargo, eleccion, distrito, importe, fecha, documento, agrupacion_nombre, codlista, lista, color, grupo_edad, grupo_aporte)

          db.session.add(aporte)

        db.session.commit()

  def run(self, name):
    #self.import_agrupaciones()
    #self.import_aportantes()
    self.import_aportes()
