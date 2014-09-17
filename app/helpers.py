from app import db

from app.forms import FilterForm
from app.models import Aporte, Aportante, Agrupacion

from sqlalchemy import func

def get_filters(params):
  filters = {}
  for key in params:
    if (params[key] != 0) and (params[key] != 'todas'):
      filters[key] = params[key]
  return filters
  
# it returns the amount of donors per sex filtered by filters
def donors_per_sex(filters):
  query_join = db.session.query(Aportante).join(Aporte)

  for key in filters:
    if key == 'agrupacion':
      query_join = query_join.filter(Aporte.agrupacion.has(id = filters[key]))
    elif key == 'ciclo':
      query_join = query_join.filter_by(ciclo = filters[key])
    elif key == 'eleccion':
      query_join = query_join.filter_by(eleccion = filters[key])
    elif key == 'distrito':
      query_join = query_join.filter_by(distrito = filters[key])

  donors_by_sex_f = query_join.filter(Aportante.sexo=='F').distinct().count()
  donors_by_sex_m = query_join.filter(Aportante.sexo=='M').distinct().count()

  return [ {
  'key'    : 'Sexo',
    'values' :
    [
    {
        "label": "Femenino",
        "value" : donors_by_sex_f
      } ,
      {
        "label": "Masculino",
        "value" : donors_by_sex_m
      }
    ]}
  ]

# devuelve grupos de edad
def aportantes_por_edad(filtros):
  # filtros = ciclo, agrupacion, eleccion, distrito
  # SELECT aportes.GRUPOEDAD, COUNT(aportes.GRUPOEDAD) AS CuentaDeGRUPOEDAD FROM (SELECT aportes.GRUPOEDAD, aportantes.DOCUMENTO
  # FROM aportes INNER JOIN aportantes ON aportes.DOCUMENTO = aportantes.DOCUMENTO
  # WHERE (((aportes.CICLO)=2013) AND ((aportes.CARGO)="Diputados") AND ((aportes.ELECCIONES)="GENERALES") AND ((aportes.DISTRITO)="BUENOS AIRES"))
  # GROUP BY aportes.GRUPOEDAD, aportantes.DOCUMENTO
  # HAVING ((Not (aportes.GRUPOEDAD) Is Null))) GROUP BY aportes.GRUPOEDAD;
  pass

# it returns amount of donors per party filtered by filters
def donors_per_party(filters):

  if filters.has_key('agrupacion'):
    filters['agrupacion_id'] = filters.pop('agrupacion')

  if filters:
    where_clause = " and ". join([ "%s = '%s'" % (key,filters[key]) for key in filters.keys()])
    query = "select count(aportante_id), agrupaciones.nombre \
             from aportes inner join agrupaciones \
             on agrupacion_id = agrupaciones.id \
             where %s \
             group by agrupaciones.nombre" % where_clause
  else:
    query = "select count(aportante_id), agrupaciones.nombre \
             from aportes inner join agrupaciones \
             on agrupacion_id = agrupaciones.id \
             group by agrupaciones.nombre"

  values = db.session.execute(query).fetchall()

  return [ {
    'key'    : 'Agrupaciones',
    'values' : [ {"label": y, "value": int(x) } for (x,y) in values ]
    }
  ]

def get_boletas_filtradas(aportes):
  boletas = [] # { codlista: NN, ciclo: NNNN}
  boletas = [{'codlista': x.codlista, 'ciclo': x.ciclo} for x in aportes.distinct(Aporte.codlista)]
  return boletas

def get_donations_by_filter(filters):
  aportes = Aporte.query

  for key in filters:
    if key == 'agrupacion':
      # ToDo: Fix filter by agrupacion
      aportes = aportes.filter(Aporte.agrupacion.has(Agrupacion.id==filters[key]))
    elif key == 'ciclo':
      aportes = aportes.filter_by(ciclo = filters[key])
    elif key == 'eleccion':
      aportes = aportes.filter_by(eleccion = filters[key])
    elif key == 'distrito':
      aportes = aportes.filter_by(distrito = filters[key])
  return aportes
