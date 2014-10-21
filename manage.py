from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand
from app.utilities import GenerateJson, ImportData

app = Flask(__name__)
app.config.from_object('config')

db = SQLAlchemy(app)
migrate = Migrate(app, db)

manager = Manager(app)
manager.add_command('db', MigrateCommand)
manager.add_command('json', GenerateJson)
manager.add_command('import', ImportData)

# from app.models import Aporte, Aportante, Agrupacion

if __name__ == '__main__':
    manager.run()
