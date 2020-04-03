from app import app
from os import environ
app.run(port=int(environ.get('PORT', 5000)), host='0.0.0.0', debug=True)
