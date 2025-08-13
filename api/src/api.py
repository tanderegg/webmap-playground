import time, sys
from os import environ as env

import requests

from flask import Flask, redirect, request

from dotenv import find_dotenv, load_dotenv
from pprint import pformat

from wri_api import get_user

ENV_FILE = find_dotenv()
if ENV_FILE:
  load_dotenv(ENV_FILE)

app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY")

@app.route('/time')
def get_current_time():
  return {'time': time.time()}

@app.route("/login", methods=["GET"])
def login():
  wri_api_login_url = "https://api.resourcewatch.org/auth/login?origin=rw&callbackUrl=http://localhost:3000/api/callback&token=true"
  return redirect(wri_api_login_url, code=302)

@app.route("/callback", methods=["GET"])
def callback():
  print("Request: " + pformat(request.args))
  token = request.args.get('token')
  get_user(token)

  return redirect("/")
