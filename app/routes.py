from flask import render_template, url_for, request
from app import app
from json import loads  #, dumps # Dumps really isn't needed

#ANCHOR hostnames
SITE_3 = "localhost:8000"

# host="<host>" is a wildcard host, it will be passed to the function

#ANCHOR style routing
@app.route('/styles/<path:fname>', host="<host>")
def send_css(fname, host):
    return app.send_static_file('styles/'+fname)

#ANCHOR JS routing
@app.route('/js/<path:fname>', host="<host>")
def send_js(fname, host):
    return app.send_static_file('js/'+fname)

#ANCHOR opticor.digital
@app.route('/', host="www."+SITE_3) # Personal domain
@app.route('/', host=SITE_3)
def personal_index():
    #print("IP Chain:", request.access_route)
    return "hello. i'll have something here by the time college is out. maybe. no promises."

@app.route('/tasks', host="www."+SITE_3)
@app.route('/tasks', host=SITE_3)
def tasks_mainpage():
    return render_template("opticor.digital/tasklist.html")

@app.route('/policy', host="www."+SITE_3)
@app.route('/policy', host=SITE_3)
def policy_mainpage():
    return render_template("opticor.digital/policy.html")
