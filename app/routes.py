from flask import render_template, url_for, request
from app import app
from json import loads  #, dumps # Dumps really isn't needed

#ANCHOR hostnames

# host="<host>" is a wildcard host, it will be passed to the function

#ANCHOR style routing
@app.route('/styles/<path:fname>', host="<host>")
def send_css(fname, host=None):
    return app.send_static_file('styles/'+fname)

#ANCHOR JS routing
@app.route('/js/<path:fname>', host="<host>")
def send_js(fname, host=None):
    return app.send_static_file('js/'+fname)

#ANCHOR opticor.digital
@app.route('/', host="<host>")
def personal_index(host=None):
    #print("IP Chain:", request.access_route)
    return "hello. i'll have something here by the time college is out. maybe. no promises."

@app.route('/tasks', host="<host>")
def tasks_mainpage(host=None):
    return render_template("opticor.digital/tasklist.html")

@app.route('/policy', host="<host>")
def policy_mainpage(host=None):
    return render_template("opticor.digital/policy.html")
