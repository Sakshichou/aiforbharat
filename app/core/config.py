from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Civic-Trust Backend"
    DATABASE_URL: str = "postgresql://user:password@localhost/civic_db"
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: str = "civic-trust-evidence-bucket"
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_APP_CLIENT_ID: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
