import os

BLOB_URL = os.environ.get('BLOB_URL')
CONTAINER_NAME = os.environ.get('CONTAINER_NAME')
ACCOUNT_NAME = os.environ.get('ACCOUNT_NAME')
ACCOUNT_KEY = os.environ.get('ACCOUNT_KEY')
DB_CONNECTION_STRING_RAW = os.environ.get('DB_CONNECTION_STRING_RAW')
DB_CONNECTION_STRING_SQLALCHEMY = os.environ.get('DB_CONNECTION_STRING_SQLALCHEMY')

# Ensure these are correctly fetched
if not BLOB_URL:
    raise ValueError("BLOB_URL environment variable is not set")
if not CONTAINER_NAME:
    raise ValueError("CONTAINER_NAME environment variable is not set")
if not ACCOUNT_NAME:
    raise ValueError("ACCOUNT_NAME environment variable is not set")
if not ACCOUNT_KEY:
    raise ValueError("ACCOUNT_KEY environment variable is not set")
if not DB_CONNECTION_STRING_SQLALCHEMY:
    raise ValueError("DB_CONNECTION_STRING_SQLALCHEMY environment variable is not set")
