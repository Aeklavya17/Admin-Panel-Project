from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os
from werkzeug.utils import secure_filename

# Azure Blob Storage Configuration
ACCOUNT_NAME = os.environ.get("AZURE_ACCOUNT_NAME")
ACCOUNT_KEY = os.environ.get("AZURE_ACCOUNT_KEY")
CONNECTION_STRING = os.environ.get("AZURE_CONNECTION_STRING")
CONTAINER_NAME = os.environ.get("AZURE_CONTAINER_NAME")

BLOB_SERVICE_CLIENT = BlobServiceClient(account_url=f"https://{ACCOUNT_NAME}.blob.core.windows.net", credential=ACCOUNT_KEY)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_image_to_azure(photo):
    # Initialize Blob Service Client
    blob_service_client = BlobServiceClient.from_connection_string(CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(CONTAINER_NAME)

    filename = secure_filename(photo.filename)

    if allowed_file(photo.filename):
        blob_client = container_client.get_blob_client(filename)
        blob_client.upload_blob(photo, overwrite=True)
        thumbnail_url = blob_client.url
        return thumbnail_url
    else:
        raise Exception("File type not allowed")
