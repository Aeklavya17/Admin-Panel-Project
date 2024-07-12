from flask import Blueprint, request, jsonify
from .models import SessionLocal, EventCarousel
from .azure_utils import upload_image_to_azure, allowed_file, ACCOUNT_NAME, CONTAINER_NAME  # Add imports here
from werkzeug.utils import secure_filename
from datetime import datetime

event_bp = Blueprint('event', __name__)

@event_bp.route('/generate_image_url', methods=['POST'])
def generate_image_url():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Generate file URL
        file_url = f"https://{ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME}/{filename}"
        
        return jsonify({'file_url': file_url}), 201
    
    return jsonify({'error': 'File type not allowed'}), 400

@event_bp.route('/upload_image_to_azure', methods=['POST'])
def upload_image_to_azure_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    photo = request.files['file']
    
    try:
        thumbnail_url = upload_image_to_azure(photo)
        return jsonify({'message': 'Event updated successfully', 'thumbnail_url': thumbnail_url}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@event_bp.route('/event_carousels', methods=['POST'])
def create_event_carousel():
    session = SessionLocal()
    data = request.json
    new_carousel = EventCarousel(
        event_id=data['event_id'],
        carousel_url=data['carousel_url']
    )
    session.add(new_carousel)
    session.commit()
    session.refresh(new_carousel)
    session.close()
    return jsonify(new_carousel.id), 201

@event_bp.route('/event_carousels', methods=['GET'])
def list_event_carousels():
    session = SessionLocal()
    carousels = session.query(EventCarousel).all()
    session.close()
    return jsonify([{
        'id': carousel.id,
        'created_at': carousel.created_at,
        'updated_at': carousel.updated_at,
        'deleted_at': carousel.deleted_at,
        'event_id': carousel.event_id,
        'carousel_url': carousel.carousel_url
    } for carousel in carousels]), 200

@event_bp.route('/event_carousels/<int:carousel_id>', methods=['GET'])
def read_event_carousel(carousel_id):
    session = SessionLocal()
    carousel = session.query(EventCarousel).filter(EventCarousel.id == carousel_id).first()
    session.close()
    if carousel:
        return jsonify({
            'id': carousel.id,
            'created_at': carousel.created_at,
            'updated_at': carousel.updated_at,
            'deleted_at': carousel.deleted_at,
            'event_id': carousel.event_id,
            'carousel_url': carousel.carousel_url
        }), 200
    else:
        return jsonify({'error': 'Carousel not found'}), 404

@event_bp.route('/event_carousels/<int:carousel_id>', methods=['PUT'])
def update_event_carousel(carousel_id):
    session = SessionLocal()
    data = request.json

    carousel = session.query(EventCarousel).filter(EventCarousel.id == carousel_id).first()
    if carousel:
        carousel.event_id = data.get('event_id', carousel.event_id)
        carousel.carousel_url = data.get('carousel_url', carousel.carousel_url)
        carousel.updated_at = datetime.utcnow()
        session.commit()
        session.close()
        return jsonify({'message': 'Carousel updated successfully'}), 200
    else:
        session.close()
        return jsonify({'error': 'Carousel not found'}), 404

@event_bp.route('/event_carousels/<int:carousel_id>', methods=['DELETE'])
def delete_event_carousel(carousel_id):
    session = SessionLocal()
    carousel = session.query(EventCarousel).filter(EventCarousel.id == carousel_id).first()
    if carousel:
        carousel.deleted_at = datetime.utcnow()
        session.commit()
        session.close()
        return jsonify({'message': 'Carousel deleted successfully'}), 200
    else:
        session.close()
        return jsonify({'error': 'Carousel not found'}), 404
