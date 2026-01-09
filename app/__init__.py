from flask import Flask

app = Flask(__name__)

app.config.from_object('config.DevelopmentConfig')

# Import generals configuration

# Import controllers
from app.controllers.page.routes import page
from app.controllers.form.routes import form

# Create blueprints and register them
app.register_blueprint(page)
app.register_blueprint(form)