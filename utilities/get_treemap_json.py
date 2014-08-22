import sqlite3
import json

conn = sqlite3.connect('data/laruta.db')
cur = conn.cursor()

def query(SQL_query):
  cur.execute(SQL_query)
  return cur.fetchall()

# CSV
# CICLO,CARGO,ELECCIONES,DISTRITO,AGRUPACION,LISTA,DOCUMENTO,IMPORTE,NOMBRE
# select CICLO, ELECCIONES, NOMBRE, DOCUMENTO, IMPORTE, AGRUPACION, DISTRITO from aportes


def get_importe(ciclo, eleccion, distrito, agrupacion):
  query_importes = "SELECT SUM(IMPORTE) FROM aportes WHERE CICLO = '%s' AND ELECCIONES = '%s' AND DISTRITO = '%s' AND AGRUPACION = '%s'" % (ciclo, eleccion, distrito, agrupacion)
  importe_total = int(query(query_importes)[0][0])

  return importe_total


def get_distrito(ciclo, eleccion, distrito):
  nuevo_distrito = {"name": distrito, "children": []}

  query_agrupaciones = "SELECT AGRUPACION FROM aportes WHERE CICLO = '%s' AND ELECCIONES = '%s' AND DISTRITO = '%s'" % (ciclo, eleccion, distrito)
  agrupaciones = [x[0] for x in query(query_agrupaciones)]

  for agrupacion in agrupaciones:
    nueva_agrupacion = {"name": agrupacion, "children": []}

    importe_total = get_importe(ciclo, eleccion, distrito, agrupacion)
    nuevo_importe = {"name": "Total", "value": importe_total}
    nueva_agrupacion["children"].append(nuevo_importe)

    nuevo_distrito["children"].append(nueva_agrupacion)

  return nuevo_distrito


def main():
  results = {"name": "Ciclos", "children": []}

  query_ciclos = "SELECT DISTINCT CICLO FROM aportes"
  ciclos = [x[0] for x in query(query_ciclos)]
  for ciclo in ciclos:
    nuevo_ciclo = {"name": ciclo, "children": []}
    query_elecciones = "SELECT DISTINCT ELECCIONES as eleccion FROM aportes WHERE CICLO = '%s'" % ciclo
    elecciones = [x[0] for x in query(query_elecciones)]
    for eleccion in elecciones:
      nueva_eleccion = {"name": eleccion, "children": []}
      query_distritos = "SELECT DISTINCT DISTRITO FROM aportes WHERE CICLO = '%s' AND ELECCIONES = '%s'" % (ciclo, eleccion)
      distritos = [x[0] for x in query(query_distritos)]
      for distrito in distritos:
        nuevo_distrito = get_distrito(ciclo, eleccion, distrito)
        nueva_eleccion["children"].append(nuevo_distrito)
      nuevo_ciclo["children"].append(nueva_eleccion)
    print nuevo_ciclo
    results["children"].append(nuevo_ciclo)

  conn.close()

  with open('data/treemap_elecciones.json','w') as outfile:
    json.dump(results, outfile)


if __name__ == "__main__":
  main()
