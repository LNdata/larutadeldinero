Financiamiento de campañas
==========================


Si queres, podes bajar el código fuente y mirarlo en tu maquina. Para correrlo:


Crear virtualenv

  virtualenv env
  . env/bin/activate

Crear base de datos y setear variable de ambiente DATABASE_URL

Copiar config.py.psql o config.py.mysql a config.py dependiendo de si usan postgresql o mysql.

Para migrar la base de datos usar

    python manage.py db init

Para importar los registros a la base de datos hay que usar

    python manage.py import

desde el directorio raíz (inicias el servidor web)

    python run.py

desde el navegador lo accedes

    http://localhost:8080/


Proyectos similares en Argentina

* Dinero y Politica - Elecciones 2011 http://dineroypolitica.org/

Webs de donde se tomaron datos

* http://www.cuitonline.com/search.php?q=20-07610794-8
* http://www.andytow.com/blog/
* http://electoral.gov.ar/informe_financiamiento_generales_2013.php#if
* http://electoral.gov.ar/fp.php
* http://www.afip.gob.ar/genericos/cInscripcion/archivoCompleto.asp
* http://buscardatos.com/Personas/

Realizado en Hackaton La Ruta del Dinero en 2014, organizado por Hack/Hackers Buenos Aires.

Original privado en https://github.com/rbrom/la-ruta-del-dinero


Procesos en manejo de los datos: http://blog.apps.npr.org/2014/09/02/reusable-data-processing.html
