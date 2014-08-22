import csv
from flask import Flask
from flask import render_template
from flask_bootstrap import Bootstrap
from flask_wtf import Form
from wtforms.validators import DataRequired
from wtforms import TextField, TextAreaField, HiddenField, ValidationError, RadioField,\
    BooleanField, SubmitField, IntegerField, FormField, validators

app = Flask(__name__)
Bootstrap(app)
app.config['SECRET_KEY'] = 'development'

csv_path = './data/aportes_2013.csv'
#"ELECCIONES","CARGO","CODDISTRITO","DISTRITO","NUM","AGRUPACION","LISTA","NOMBRE","APELLIDO","DOCUMENTO","CUIT/L","DOMICILIO","FECHA","TIPO","IMPORTE","APORTE","CODLISTA","NUMCUIT","CUIT"

csv_obj = csv.DictReader(open(csv_path, 'r'))
csv_list = list(csv_obj)

csv_dict = dict([ [o['DOCUMENTO'], o] for o in csv_list])


class SearchForm(Form):
  nombre = TextField('Nombre', validators=[DataRequired()], description='Nombre y apellido de quien aporta')

# PASAR A BASE DE DATOS Y HACERLO EFICIENTEMENTE
def search(nombre):
  result_list = []
  for o in csv_list:
    if (o['NOMBRE'].lower() == nombre or o['APELLIDO'].lower() == nombre):
      result_list.append(o)
  return result_list

@app.route("/",methods=('GET', 'POST'))
def index():
    form = SearchForm()
    if form.validate_on_submit():
      result_list = search(form.nombre.data.lower())

      return render_template('index.html', object_list=result_list, form=form)
    return render_template('index.html',
                           object_list=csv_list, form=form)

@app.route('/<documento>/')
def detail(documento):
    return render_template('detail.html',
                            object=csv_dict[documento],)


if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=8000,
        use_reloader=True,
        debug=True,
    )
