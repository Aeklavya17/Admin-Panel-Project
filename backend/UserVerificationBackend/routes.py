from flask import Blueprint, request, jsonify
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
import psycopg2
from config import BLOB_URL, CONTAINER_NAME, ACCOUNT_NAME, ACCOUNT_KEY, DB_CONNECTION_STRING_RAW

download_bp = Blueprint('download', __name__)

def get_blob_service_client():
    return BlobServiceClient(
        account_url=f"{BLOB_URL}",
        credential=ACCOUNT_KEY
    )

@download_bp.route('/fetch-users', methods=['GET'])
def fetch_users():
    try:
        # Connect to the database
        conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
        cur = conn.cursor()

        # Fetch email_id, image_url from user_verification and verified from users
        cur.execute("""
            SELECT uv.email_id, uv.image_url, u.verified
            FROM user_verification uv
            JOIN users u ON uv.email_id = u.email
        """)
        user_data = cur.fetchall()

        cur.close()
        conn.close()

        if not user_data:
            return jsonify({'message': 'No users found'}), 404

        users = []
        for row in user_data:
            users.append({
                'email_id': row[0],
                'image_url': row[1],
                'verified': row[2]
            })

        return jsonify(users), 200

    except Exception as e:
        print(f"Fetch users error: {e}")
        return jsonify({'message': 'Error fetching users', 'error': str(e)}), 500

