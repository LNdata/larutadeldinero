from __future__ import unicode_literals

from flask import Flask, render_template, request, g, current_app
from flask.ext.paginate import Pagination

import sqlite3


app = Flask(__name__)
app.config['PER_PAGE'] = 10
app.config['LINK_SIZE'] = 'lg'
app.config['CSS_FRAMEWORK'] = 'bootstrap3'

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Users/gaba/Code/opennews/rutadeldinero_elecciones/larutadeldinero/data/laruta.db'


@app.before_request
def before_request():
  g.conn = sqlite3.connect('data/laruta.db')
  g.conn.row_factory = sqlite3.Row
  g.cur = g.conn.cursor()


@app.teardown_request
def teardown(error):
  if hasattr(g, 'conn'):
    g.conn.close()

# def get_aportes():
#   APORTES_FILE = './data/aportes_con_nombre.json'
#   with open(APORTES_FILE) as json_data:
#     aportes = json.load(json_data)['aportes']
#
#   return aportes

@app.route("/")
def index():
  g.cur.execute('select count(*) from aportes')
  total = g.cur.fetchone()[0]
  page, per_page, offset = get_page_items()
  #filters = get_filters()

  sql = 'select CICLO, ELECCIONES, NOMBRE, DOCUMENTO, IMPORTE, AGRUPACION, DISTRITO from aportes order by CICLO limit {}, {}'\
        .format(offset, per_page)

  g.cur.execute(sql)

  aportes = g.cur.fetchall()
  pagination = get_pagination(page=page,
                              per_page=per_page,
                              total=total,
                              record_name='aportes',
                              )

  return render_template('index.html', aportes=aportes,
                                        page=page,
                                        per_page=per_page,
                                        pagination=pagination,
                                      )

def get_css_framework():
  return current_app.config.get('CSS_FRAMEWORK', 'bootstrap3')

def get_link_size():
  return current_app.config.get('LINK_SIZE', 'sm')

def get_page_items():
  page = int(request.args.get('page', 1))
  per_page = request.args.get('per_page')
  if not per_page:
    per_page = current_app.config.get('PER_PAGE', 10)
  else:
    per_page = int(per_page)

  offset = (page - 1) * per_page
  return page, per_page, offset

def get_pagination(**kwargs):
  kwargs.setdefault('record_name', 'records')

  return Pagination(css_framework=get_css_framework(),
                    link_size=get_link_size(),
                    **kwargs
                    )
#
# @app.route('/filter', methods=['GET', 'POST'])
# def filter():
#   form = FilterForm()
#   if form.validate_on_submit():
#     filter
#   return redirect(url_for('index'))


@app.route('/aportante/<document>')
def aportante(document):
    return render_template('aportante.html')


if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=8000,
        use_reloader=True,
        debug=True,
    )
