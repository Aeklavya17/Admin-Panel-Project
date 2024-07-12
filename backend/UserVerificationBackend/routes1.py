import datetime
from flask import Blueprint, request, jsonify
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import psycopg2
from config import BLOB_URL, CONTAINER_NAME, ACCOUNT_NAME, ACCOUNT_KEY, DB_CONNECTION_STRING_RAW

download_bp1 = Blueprint('download1', __name__)  # Changed the Blueprint name to 'download1'

def get_blob_service_client():
    return BlobServiceClient(
        account_url=f"{BLOB_URL}",
        credential=ACCOUNT_KEY  # Use account key for authentication
    )

@download_bp1.route('/fetch-document', methods=['GET'])
def fetch_document():
    email_id = request.args.get('email_id')

    if not email_id:
        return jsonify({'message': 'Email ID is required'}), 400

    try:
        # Connect to the database and retrieve document_url
        conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
        cur = conn.cursor()
        cur.execute("SELECT image_url FROM user_verification WHERE email_id = %s", (email_id,))
        result = cur.fetchone()

        if not result:
            cur.close()
            conn.close()
            return jsonify({'message': 'Document not found'}), 404

        document_url = result[0]

        # Extract blob name from document_url
        blob_name = document_url.split('/')[-1]
        
        # Check if blob exists
        blob_service_client = get_blob_service_client()
        blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
        properties = blob_client.get_blob_properties()

        # Generate SAS token for blob access
        sas_token = generate_blob_sas(
            account_name=ACCOUNT_NAME,
            container_name=CONTAINER_NAME,
            blob_name=blob_name,
            account_key=ACCOUNT_KEY,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        )

        signed_url = blob_client.url + '?' + sas_token

        cur.close()
        conn.close()

        return jsonify({'message': 'Document found', 'signedUrl': signed_url}), 200

    except Exception as e:
        print(f"Fetch document error: {e}")
        return jsonify({'message': 'Error fetching document', 'error': str(e)}), 500

@download_bp1.route('/verify-user', methods=['POST'])
def verify_user():
    data = request.get_json()
    email_id = data.get('email_id')

    if not email_id:
        return jsonify({'message': 'Email ID is required'}), 400

    try:
        # Connect to the database and update verification status
        conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
        cur = conn.cursor()

        # Update verification status
        cur.execute("""
            UPDATE public.users SET verified= True WHERE email = %s;
        """, (email_id,))
        
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({'message': 'User verified successfully'}), 200

    except Exception as e:
        print(f"Verify user error: {e}")
        return jsonify({'message': 'Error verifying user', 'error': str(e)}), 500
