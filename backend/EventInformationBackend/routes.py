from flask import Blueprint, request, jsonify
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from werkzeug.utils import secure_filename
from azure.storage.blob import BlobServiceClient
from config import BLOB_URL, CONTAINER_NAME, ACCOUNT_NAME, ACCOUNT_KEY, DB_CONNECTION_STRING_SQLALCHEMY

# Ensure that the DB_CONNECTION_STRING_SQLALCHEMY is not None
if not DB_CONNECTION_STRING_SQLALCHEMY:
    raise ValueError("DB_CONNECTION_STRING_SQLALCHEMY is not set in config")

# Initialize SQLAlchemy
engine = create_engine(DB_CONNECTION_STRING_SQLALCHEMY)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define Event model
class Event(Base):
    __tablename__ = 'events'
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    duration = Column(Float, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    language = Column(String, nullable=False)
    about = Column(String, nullable=False)
    city = Column(String, nullable=False)
    lowest_ticket_price = Column(Float, nullable=False)
    age_criteria = Column(String, nullable=False)
    tags = Column(String, nullable=True)
    tickets_available = Column(Boolean, nullable=False)

class Banner(Base):
    __tablename__ = 'event_banners'
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    eventid = Column(Integer, nullable=False)
    banner_url = Column(String, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize Blob Service Client
blob_service_client = BlobServiceClient(account_url=BLOB_URL, credential=ACCOUNT_KEY)
container_client = blob_service_client.get_container_client(CONTAINER_NAME)

event_bp = Blueprint('events', __name__)

@event_bp.route('/events', methods=['POST'])
def create_event():
    session = SessionLocal()
    data = request.form
    thumbnail_url = ''

    # Handle file upload
    if 'photo' in request.files:
        photo = request.files['photo']
        if photo.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        filename = secure_filename(photo.filename)
        blob_client = container_client.get_blob_client(filename)
        blob_client.upload_blob(photo, overwrite=True)
        thumbnail_url = blob_client.url

    # Convert tickets_available to boolean
    tickets_available = data.get('tickets_available', 'false').lower() in ['true', '1', 'yes']

    new_event = Event(
        name=data['name'],
        category=data['category'],
        duration=float(data['duration']),
        thumbnail_url=thumbnail_url,
        language=data['language'],
        about=data['about'],
        city=data['city'],
        lowest_ticket_price=float(data['lowest_ticket_price']),
        age_criteria=data['age_criteria'],
        tags=data.get('tags'),  # Optional field
        tickets_available=tickets_available
    )

    try:
        session.add(new_event)
        session.commit()
        event_id = new_event.id  # Access the id before closing the session
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

    return jsonify({'id': event_id}), 201

@event_bp.route('/events/<int:event_id>', methods=['GET'])
def read_event(event_id):
    session = SessionLocal()
    event = session.query(Event).filter(Event.id == event_id, Event.deleted_at == None).first()
    session.close()

    if event:
        return jsonify({
            'id': event.id,
            'created_at': event.created_at,
            'updated_at': event.updated_at,
            'deleted_at': event.deleted_at,
            'name': event.name,
            'category': event.category,
            'duration': event.duration,
            'thumbnail_url': event.thumbnail_url,
            'language': event.language,
            'about': event.about,
            'city': event.city,
            'lowest_ticket_price': event.lowest_ticket_price,
            'age_criteria': event.age_criteria,
            'tags': event.tags,
            'tickets_available': event.tickets_available
        }), 200
    else:
        return jsonify({'error': 'Event not found'}), 404

@event_bp.route('/events/<int:event_id>', methods=['PATCH'])
def update_event(event_id):
    session = SessionLocal()
    event = session.query(Event).filter(Event.id == event_id, Event.deleted_at == None).first()

    if not event:
        session.close()
        return jsonify({'error': 'Event not found'}), 404

    data = request.form
    event.name = data.get('name', event.name)
    event.category = data.get('category', event.category)
    event.duration = float(data.get('duration', event.duration))
    event.language = data.get('language', event.language)
    event.about = data.get('about', event.about)
    event.city = data.get('city', event.city)
    event.lowest_ticket_price = float(data.get('lowest_ticket_price', event.lowest_ticket_price))
    event.age_criteria = data.get('age_criteria', event.age_criteria)
    event.tags = data.get('tags', event.tags)

    tickets_available = data.get('tickets_available', '').lower() == 'true'
    event.tickets_available = tickets_available

    # Handle file upload
    if 'photo' in request.files:
        photo = request.files['photo']
        if photo.filename != '':
            filename = secure_filename(photo.filename)
            blob_client = container_client.get_blob_client(filename)
            blob_client.upload_blob(photo, overwrite=True)
            event.thumbnail_url = blob_client.url

    try:
        session.commit()
        session.close()
        return jsonify({'message': 'Event updated successfully'}), 200
    except Exception as e:
        session.rollback()
        session.close()
        return jsonify({'error': str(e)}), 400

@event_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    session = SessionLocal()
    event = session.query(Event).filter(Event.id == event_id, Event.deleted_at == None).first()

    if event:
        event.deleted_at = datetime.utcnow()
        session.commit()
        session.close()
        return jsonify({'message': 'Event deleted successfully'}), 200
    else:
        session.close()
        return jsonify({'error': 'Event not found'}), 404

@event_bp.route('/events', methods=['GET'])
def list_events():
    session = SessionLocal()
    events = session.query(Event).filter(Event.deleted_at == None).all()
    session.close()
    
    return jsonify([{
        'id': event.id,
        'created_at': event.created_at,
        'updated_at': event.updated_at,
        'deleted_at': event.deleted_at,
        'name': event.name,
        'category': event.category,
        'duration': event.duration,
        'thumbnail_url': event.thumbnail_url,
        'language': event.language,
        'about': event.about,
        'city': event.city,
        'lowest_ticket_price': event.lowest_ticket_price,
        'age_criteria': event.age_criteria,
        'tags': event.tags,
        'tickets_available': event.tickets_available
    } for event in events]), 200
