from flask import Flask

app = Flask(__name__)

app.config.from_object('config.DevelopmentConfig')

# Import generals configuration

# Import controllers

# Create blueprints and register them