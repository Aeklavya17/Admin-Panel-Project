from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import os

# SQLAlchemy Configuration
DATABASE_URL = os.environ.get("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class EventCarousel(Base):
    __tablename__ = 'event_carousels'
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    event_id = Column(Integer, nullable=False)
    carousel_url = Column(String, nullable=False)

# Create all tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Error creating tables: {e}")
