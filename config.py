# Statement for enabling the development environment
DEBUG = False

# Define the application directory
import os
basedir = os.path.abspath(os.path.dirname(__file__))

# Define the database - we are working with
# SQLite 'sqlite:///absolute/path/to/database'
# PSQL 'postgresql://username:password@hostname/database'
#postgresql://user_db:password@localhost/ruta
SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
SQLALCHEMY_COMMMIT_ON_TEARDOWN = True

SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
DATABASE_CONNECT_OPTIONS = {}

# Application threads. A common general assumption is
# using 2 per available processor cores - to handle
# incoming requests using one and performing background
# operations using the other.
THREADS_PER_PAGE = 2

# Enable protection agains *Cross-site Request Forgery (CSRF)*
CSRF_ENABLED     = True

# Use a secure, unique and absolutely secret key for
# signing the data.
CSRF_SESSION_KEY = "secret"

# Secret key for signing cookies
SECRET_KEY = "secret"

# Pagination Config
PER_PAGE = 50
LINK_SIZE = 'lg'
CSS_FRAMEWORK = 'bootstrap3'
