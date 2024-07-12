from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from config import DB_CONNECTION_STRING_RAW

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email.endswith('@senkusha.in'):
        return jsonify({"message": "Invalid email domain"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    verified = email.endswith('@senkusha.in')

    conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO admins (email, password, verified) VALUES (%s, %s, %s)", (email, hashed_password, verified))
        conn.commit()
    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({"message": "User already exists"}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM admins WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and check_password_hash(user[0], password):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401
    
@auth_bp.route('/admin-details', methods=['GET'])
def admin_details():
    email = request.args.get('email')

    conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM admins WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        return jsonify({"email": user[0]}), 200
    else:
        return jsonify({"message": "Admin not found"}), 404

@auth_bp.route('/update-admin', methods=['POST'])
def update_admin():
    data = request.get_json()
    email = data.get('email')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    try:
        if not email or not old_password or not new_password:
            return jsonify({'message': 'Email, old_password, or new_password missing'}), 400

        # Validate old password and update to new password
        conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
        cur = conn.cursor()
        cur.execute("SELECT password FROM admins WHERE email = %s", (email,))
        result = cur.fetchone()

        if result and check_password_hash(result[0], old_password):
            hashed_password = generate_password_hash(new_password)
            cur.execute("UPDATE admins SET password = %s WHERE email = %s", (hashed_password, email))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({'message': 'Profile updated successfully'}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Update admin error: {e}")
        return jsonify({'message': 'Error updating profile', 'error': str(e)}), 500

@auth_bp.route('/delete-admin', methods=['POST'])
def delete_admin():
    data = request.get_json()
    email = data.get('email')

    try:
        # Delete admin account
        conn = psycopg2.connect(DB_CONNECTION_STRING_RAW)
        cur = conn.cursor()
        cur.execute("DELETE FROM admins WHERE email = %s", (email,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Account deleted successfully'}), 200
    except Exception as e:
        print(f"Delete admin error: {e}")
        return jsonify({'message': 'Error deleting account', 'error': str(e)}), 500
