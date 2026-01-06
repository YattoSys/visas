from flask import render_template
from .routes import page

@page.route('/')
def index():
    return render_template('index.html')