from app import db
from app.models import Agrupacion, Aportante, Aporte
import datetime
from time import gmtime, strftime


def import_agrupaciones():
  # agrupaciones
  # array of names
  with open('data/agrupaciones.txt','r') as f:
    data = eval(f.read())
    for name in data:
      agrupacion = Agrupacion(nombre=name)
      db.session.add(agrupacion)
    db.session.commit()

def import_aportantes():
  # aportantes
  #DOCUMENTO,CUIT/L,NOMBRES,APELLIDO,PERSONA,SEXO,CLASE,DESIGNACIONES,CONTRATO,AUTORIDAD,CANDIDATURA,MANDATO-DIP,MANDATO-SEN,IMP GANANCIAS,IMP IVA,MONOTRIBUTO,INTEGRANTE SOC,EMPLEADOR,ACTIVIDAD MONOTRIBUTO,LAT,LON
  with open('data/aportantes.csv','r') as f:
    data = f.readlines()[1:]
    for line in data:
      data = line.split(',')
      documento = data[0].split('.')[0]
      cuit = data[1]
      nombre = data[2]
      apellido = data[3]
      persona = data[4]
      sexo = data[5]
      if not sexo in ['M', 'F', '']:
        print "Problem with row, document %s." % documento
        continue
      clase = int(float(data[6])) if data[6] else 0
      # designaciones = data[7]
      # contrato = data[8]
      # autoridad = data[9]
      # candidatura = data[10]
      # mandato_dip = data[11]
      # mandato_sen = data[12]
      # imp_ganancias = data[13]
      # imp_iva = data[14]
      # monotributo = data[15]
      # integrante_soc = data[16]
      # empleador = data[17]
      # actividad_monotributo = data[18]
      lat = data[19]
      lon = data[20]
      # aportante = Aportante(documento, cuit, nombre, apellido, persona, sexo, clase, designaciones, contrato, autoridad, candidatura, mandato_dip, mandato_sen, imp_ganancias, imp_iva, monotributo, integrante_soc, empleador, actividad_monotributo, lat, lon)
      aportante = Aportante(documento, cuit, nombre, apellido, persona, sexo, clase, lat, lon)
      db.session.add(aportante)
    db.session.commit()

def import_aportes():
  # aportes
#CICLO,CARGO,ELECCIONES,PERSONA,CODDISTRITO,DISTRITO,NUM,AGRUPACION,LISTA,DOCUMENTO,FECHA,IMPORTE,CODLISTA,COLOR
  with open('data/aportes.csv','r') as f:
    data = f.readlines()[1:]
    for line in data:
      data = line.split(',')
      try:
        ciclo = int(float(data[0]))
        cargo = data[1]
        eleccion = data[2]
        persona = data[3]
        coddistrito = data[4]
        distrito = data[5]
        num = int(data[6]) if data[6] else 0
        agrupacion_nombre = data[7]
        lista = data[8]
        documento = data[9].split('.')[0]
        fecha = strftime(data[10], gmtime()) #datetime.datetime.strftime(data[10], gmtime()).date() #'6/8/2013 00:00:00'

        importe = float(data[11])
        codlista = int(data[12]) if data[12] else 0
        color = data[13]
      except:
          print "Problema con row de documento %s." % data[9]
          continue
      aporte = Aporte(ciclo, cargo, eleccion, distrito, importe, fecha, documento, agrupacion_nombre, lista)
      db.session.add(aporte)
    db.session.commit()

if __name__ == '__main__':
  import_agrupaciones()
  import_aportantes()
  import_aportes()
