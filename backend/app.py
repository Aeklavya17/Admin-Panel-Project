# app.py or wherever your Flask app initialization is done
from dotenv import load_dotenv
import os
load_dotenv()  # Load environment variables from a .env file

from flask import Flask
from flask_cors import CORS
from UserVerificationBackend.routes import download_bp
from UserVerificationBackend.routes1 import download_bp1
from UserVerificationBackend.auth import auth_bp
from EventInformationBackend.routes import event_bp
from EventCarouselBackend.routes import event_bp as carousel_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(download_bp)
app.register_blueprint(download_bp1)
app.register_blueprint(event_bp)
app.register_blueprint(carousel_bp)

if __name__ == "__main__":
    app.run(debug=True,host='0.0.0.0', port=int(os.environ.get("PORT", 5001)))

# if __name__ == '__main__':
#     app.run(debug=True,port=5001)
