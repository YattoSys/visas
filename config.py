class Config:
    pass

class ProductionConfig(Config):
    pass

class TestingConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'dev-secret-key-change-in-production'