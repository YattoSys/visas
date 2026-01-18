class Config:
    DEBUG = False
    TESTING = False
    SECRET_KEY = 'K1R1T08312'

class ProductionConfig(Config):
    pass

class TestingConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'dev-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = 'postgresql://kirito:sKirito9083@localhost/visas_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Mercado Pago Configuration
    # Obtén tus credenciales en: https://www.mercadopago.com/developers/panel/credentials
    MERCADOPAGO_ACCESS_TOKEN = 'TU_ACCESS_TOKEN_AQUI'  # Reemplazar con tu Access Token
    MERCADOPAGO_PUBLIC_KEY = 'TU_PUBLIC_KEY_AQUI_PROXIMAMENTE'  # Reemplazar con tu Public Key (opcional para frontend)
    # Precio del servicio
    SERVICE_PRICE = 100.00
    # Moneda del pago (USD, MXN, ARS, BRL, etc.)
    PAYMENT_CURRENCY = 'USD'
    # Google reCAPTCHA Configuration
    # Obtén tus credenciales en: https://www.google.com/recaptcha/admin
    RECAPTCHA_SITE_KEY = 'TU_SITE_KEY_AQUI'  # Reemplazar con tu Site Key
    RECAPTCHA_SECRET_KEY = 'TU_SECRET_KEY_AQUI'  # Reemplazar con tu Secret Key