from app import db

# from app.forms import FilterForm
from app.models import Aporte, Aportante, Agrupacion

from sqlalchemy import func

from flask import json
import ast

def get_where_clause(filters):
  # filters [{u'name': u'ciclo', u'val': 2009, u'op': u'eq'}, ... ]
  # generate where clause with the filters
  filters_list = []

  for filter in filters:
    name = filter['name']
    val = filter['val'] #ast.literal_eval(filter["val"])
    op = filter['op']

    if op == 'in' or type(val) is list:

      val_tmp = []
      for v in val:
        if type(v) is str:
          val_tmp.append("'%s'" % (v.encode('UTF-8')))
        else:
          val_tmp.append("'%s'" % (v))
      
      filters_list.append( "%s IN (%s)" % (name, ", ". join(val_tmp)))

    elif op == 'eq':

      if type(val) is str:
        filters_list.append("%s = '%s'" % (filter['name'].encode('UTF-8'), val.encode('UTF-8')))
      else:
        filters_list.append("%s = '%s'" % (filter['name'].encode('UTF-8'), val))

    elif op == 'neq':

      if type(val) is str:
        filters_list.append("%s <> '%s'" % (filter['name'].encode('UTF-8'), val.encode('UTF-8')))
      else:
        filters_list.append("%s <> '%s'" % (filter['name'].encode('UTF-8'), val))

    elif op == 'has':
      # {u'name': u'aportante', u'val': {u'name': u'sexo', u'val': [u'F'], u'op': u'in'}, u'op': u'has'}
      name = "%s.%s" % (filter['name'] , filter['val']['name'])
      if filter['val']['op'] == 'in':
        for value in filter['val']['val']:
          filters_list.append("%s = '%s'" % (name, value))
      elif filter['val']['op'] == 'eq':
        filters_list.append("%s = '%s'" % (name, filter['val']['val']))
      elif filter['val']['op'] == 'neq':
        filters_list.append("%s <> '%s'" % (name, filter['val']['val']))

  where_clause = " and ". join(filters_list)
  print where_clause
  return where_clause


def filter_aportes(aportes, filters):
  for filter in filters:
    if filter["name"] == 'aportante':
      field = "Aportante.%s" % filter['val']['name']
      if filter['val']['op'] == 'eq':
        aportes = aportes.filter(eval(field) == filter['val']['val'])
      
      elif filter['val']['op'] == 'in':
        field = "Aportante.%s.in_(%s)" % (filter['val']['name'], filter['val']['val'])
        aportes = aportes.filter(eval(field))

    elif filter["op"] == "eq":
        field = "Aporte.%s" % filter["name"]
        aportes = aportes.filter(eval(field) == filter["val"])
    elif filter["op"] == "in":
      field = "Aporte.%s.in_(%s)" % (filter["name"], filter["val"])
      aportes = aportes.filter(eval(field))
  print aportes
  return aportes
  
# it returns the amount of donors per sex filtered by filters
def donors_per_sex(filters):
  query_join = db.session.query(Aportante).join(Aporte)

  for filter in filters:
    # filter {u'name': u'ciclo', u'val': 2009, u'op': u'eq'}
    if filter['name'] == 'agrupacion':
      query_join = query_join.filter(Aporte.agrupacion.has(nombre = filters['val']))
    elif filter['name'] == 'ciclo':
      query_join = query_join.filter_by(ciclo = filter['val'])
    elif filter['name'] == 'eleccion':
      query_join = query_join.filter_by(eleccion = filter['val'])
    elif filter['name'] == 'distrito':
      query_join = query_join.filter_by(distrito = filter['val'])

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

# it returns the amount of donors per age range filtered by filters
def donors_per_age(filters):
  # filters [{u'name': u'ciclo', u'val': 2009, u'op': u'eq'}, ... ]

  if filters:

    #where_clause = " and ". join([ "%s = '%s'" % (filter["name"], filter["val"]) for filter in filters])
    where_clause = get_where_clause(filters)

    query = """SELECT grupo_edad, COUNT(grupo_edad) AS CuentaDeGrupoEdad \
               FROM ( \
                      SELECT aportes.grupo_edad as grupo_edad, aportes.grupo_aporte as grupo_aporte, aportante.documento \
                      FROM aportes INNER JOIN aportantes as aportante ON aportes.aportante_id = aportante.id \
                      WHERE %s AND grupo_edad != "" \
                      GROUP BY aportes.grupo_edad, aportante.documento \
                      HAVING ( (Not (aportes.grupo_edad) Is Null) ) \
                     ) AS T \
               GROUP BY grupo_edad \
               ORDER BY grupo_edad"""  % where_clause
  else:
    query = """SELECT grupo_edad, COUNT(grupo_edad) AS CuentaDeGrupoEdad \
               FROM ( \
                      SELECT aportes.grupo_edad as grupo_edad, aportantes.documento \
                      FROM aportes INNER JOIN aportantes ON aportes.aportante_id = aportantes.id \
                      WHERE grupo_edad != "" \
                      GROUP BY aportes.grupo_edad, aportantes.documento \
                      HAVING ( (Not (aportes.grupo_edad) Is Null) ) \
                     ) AS T \
               GROUP BY grupo_edad
               ORDER BY grupo_edad"""

  values = db.session.execute(query).fetchall()

  return [ {
    'key'    : 'Edades',
    'values' : [ {"label": x, "value": int(y) } for (x,y) in values ]
    }
  ]

# it returns amount of donors per party filtered by filters
def donors_per_party(filters):
  # filters [{u'name': u'ciclo', u'val': 2009, u'op': u'eq'}, ... ]

  if filters:
    #where_clause = " and ". join( [ "%s = '%s'" % (filter["name"],filter["val"]) for filter in filters])
    where_clause = get_where_clause(filters)
    query = "select count(aportante_id) as cantidad_aportantes, agrupaciones.nombre \
             from aportes inner join agrupaciones \
             on agrupacion_id = agrupaciones.id \
             join aportantes as aportante on aportante.id = aportante_id \
             where %s \
             group by agrupaciones.nombre \
             order by cantidad_aportantes DESC \
             LIMIT 10" % where_clause
  else:
    query = "select count(aportante_id) as cantidad_aportantes, agrupaciones.nombre \
             from aportes inner join agrupaciones \
             on agrupacion_id = agrupaciones.id \
             group by agrupaciones.nombre \
             order by cantidad_aportantes DESC \
             LIMIT 10"

  values = db.session.execute(query).fetchall()

  return [ {
    'key'    : 'Agrupaciones',
    'values' : [ {"label": y, "value": int(x) } for (x,y) in values ]
    }
  ]

def amount_per_sex(filters):
  # ?q={"filters":[{"name":"age","op":"eq","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"in","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"has","val":"22"}]}

  query_join = db.session.query(func.sum(Aporte.importe))

  for filter in filters:
    field = "Aporte.%s" % filter["name"]
    op = filter["op"]
    val = filter["val"]
    if op == "eq":
      query_join = query_join.filter(eval(field) == val)
    elif op == "in":
      for v in val:
        query_join = query_join.filter(eval(field) == v)
    #elif op == "has":
    #  query_join = query_join.filter(Aporte.agrupacion.has(id = filters[key]))

  import_by_sex_f = query_join.filter(Aporte.aportante.has(Aportante.sexo=='F')).distinct().all()[0][0]
  if not import_by_sex_f is None:
    import_by_sex_f = int(import_by_sex_f)

  import_by_sex_m = query_join.filter(Aporte.aportante.has(Aportante.sexo=='M')).distinct().all()[0][0]
  if not import_by_sex_m is None:
    import_by_sex_m = int(import_by_sex_m)


  return [ {
  'key'    : 'Sexo',
    'values' :
    [
    {
        "label": "Femenino",
        "value" : import_by_sex_f
      } ,
      {
        "label": "Masculino",
        "value" : import_by_sex_m
      }
    ]}
  ]

def amount_per_age(filters):
  # ?q={"filters":[{"name":"age","op":"eq","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"in","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"has","val":"22"}]}
  #if filters.has_key('agrupacion'):
  #  filters['agrupacion_id'] = filters.pop('agrupacion')

  if filters:

    where_clause = get_where_clause(filters)

    query = """SELECT grupo_edad, SUM(importe) AS CuentaDeGrupoEdad \
               FROM ( \
                      SELECT aportes.grupo_edad as grupo_edad, aportes.importe as importe, aportante.documento \
                      FROM aportes INNER JOIN aportantes as aportante ON aportes.aportante_id = aportante.id \
                      WHERE %s AND GRUPO_EDAD != "" \
                     GROUP BY aportes.grupo_edad, aportante.documento \
                     HAVING ( (Not (aportes.grupo_edad) Is Null) ) \
                     ) AS T \
               GROUP BY grupo_edad \
               ORDER BY grupo_edad"""  % where_clause
  else:
    query = """SELECT grupo_edad, SUM(importe) AS importe \
               FROM ( \
                      SELECT aportes.grupo_edad as grupo_edad, aportes.importe as importe , aportantes.documento \
                      FROM aportes INNER JOIN aportantes ON aportes.aportante_id = aportantes.id \
                      WHERE grupo_edad != "" \
                      GROUP BY aportes.grupo_edad, aportantes.documento \
                      HAVING ( (Not (aportes.grupo_edad) Is Null) ) \
                     ) AS T \
               GROUP BY grupo_edad \
               ORDER BY grupo_edad"""

  values = db.session.execute(query).fetchall()

  return [ {
    'key'    : 'Edades',
    'values' : [ {"label": x, "value": int(y) } for (x,y) in values ]
    }
  ]


def amount_per_party(filters):
  # ?q={"filters":[{"name":"age","op":"eq","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"in","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"has","val":"22"}]}

  if filters:
    #where_clause = " and ". join( [ "%s = '%s'" % (filter["name"],filter["val"]) for filter in filters])
    where_clause = get_where_clause(filters)

    query = "select sum(importe) as monto, agrupaciones.nombre \
             from aportes inner join agrupaciones \
             on agrupacion_id = agrupaciones.id \
             join aportantes as aportante on aportes.aportante_id = aportante.id\
             where %s \
             group by agrupaciones.nombre \
             order by monto DESC \
             limit 10" % where_clause
  else:
    query = "select sum(importe) as monto, agrupaciones.nombre \
             from aportes inner join agrupaciones \
             on agrupacion_id = agrupaciones.id \
             group by agrupaciones.nombre \
             order by monto DESC \
             limit 10"

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

def get_donations(filters):
  aportes = Aporte.query.with_entities(Aporte.id, Aporte.ciclo, Aporte.cargo, Aporte.eleccion, Aporte.distrito, Aporte.lista, Aporte.importe, Aporte.color, Aporte.grupo_edad, Aporte.aportante, Aporte.agrupacion)

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

def parse_filters(query):
  # ?q={"filters":[{"name":"age","op":"eq","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"in","val":"22"}]}
  # ?q={"filters":[{"name":"age","op":"has","val":"22"}]}

  filters = {}

  if query:
    query = json.loads(query)
    filters = query["filters"]

  return filters

# Para procesar los parametros antes de hacer el request de aportantes para el mapa
def pre_get_many_aportantes_mapa(search_params=None, **kw):
    if search_params is None:
        return
    filt_lat = dict(name='lat', op='neq', val="")
    filt_lon = dict(name='lon', op='neq', val="")

    if 'filters' not in search_params:
        search_params['filters'] = []

    search_params['filters'].append(filt_lat)
    search_params['filters'].append(filt_lon)

def get_treemap():
  results = {"name": "Ciclos", "type":"treemap", "children": []}

  ciclos = [x.ciclo for x in db.session.query(Aporte).group_by(Aporte.ciclo).all()]

  # CICLO ------
  for ciclo in ciclos:
    nuevo_ciclo = {"name": ciclo, "type": "ciclo", "children": []}
    elecciones = [x.eleccion for x in db.session.query(Aporte).filter(Aporte.ciclo == ciclo).group_by(Aporte.eleccion).all()]

    # ELECCION -----
    for eleccion in elecciones:
      nueva_eleccion = {"name": eleccion, "type":'eleccion', "children": []}
      distritos = [x.distrito for x in db.session.query(Aporte).filter(Aporte.ciclo == ciclo, Aporte.eleccion == eleccion).group_by(Aporte.distrito).all()]

      # DISTRITO ------
      for distrito in distritos:
        nuevo_distrito = {"name": distrito, "type": "distrito", "children": []}
        agrupaciones = [x.agrupacion_id for x in db.session.query(Aporte).filter(Aporte.ciclo == ciclo, Aporte.eleccion == eleccion, Aporte.distrito == distrito).group_by(Aporte.agrupacion_id).all()]

        # AGRUPACION ------
        for agrupacion in agrupaciones:
          # IMPORTE ------
          if agrupacion is None:
            continue
          importe_total = db.session.query(func.sum(Aporte.importe)).filter(Aporte.ciclo == ciclo, Aporte.eleccion == eleccion, Aporte.distrito == distrito, Aporte.agrupacion_id == agrupacion).scalar()
          nueva_agrupacion = {"name": Agrupacion.query.get(agrupacion).nombre, "type": "agrupacion", "value": importe_total}
          nuevo_distrito["children"].append(nueva_agrupacion)

        nueva_eleccion["children"].append(nuevo_distrito)

      nuevo_ciclo["children"].append(nueva_eleccion)

    results["children"].append(nuevo_ciclo)

  return results
