import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserVerification.css';

// Define the API base URL
const api_url = 'https://admin-panel-project.onrender.com';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function UserVerification() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [fetchingDocument, setFetchingDocument] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${api_url}/fetch-users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showErrorToast('Error fetching users. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const determineDocumentType = (url) => {
    const path = url.split('?')[0];
    const lowerCasePath = path.toLowerCase();

    if (lowerCasePath.endsWith('.pdf')) {
      return 'pdf';
    } else if (lowerCasePath.endsWith('.jpeg') || lowerCasePath.endsWith('.jpg') || lowerCasePath.endsWith('.png') || lowerCasePath.endsWith('.gif')) {
      return 'image';
    } else {
      return 'unknown';
    }
  };

  const fetchDocument = useCallback(async (email) => {
    if (fetchingDocument) return;

    try {
      setFetchingDocument(true);

      const response = await axios.get(`${api_url}/fetch-document?email_id=${email}`);
      const signedUrl = response.data.signedUrl;

      const type = determineDocumentType(signedUrl);
      setDocumentUrl(signedUrl);
      setShowPopup(true);
      setPopupType(type);
      setSelectedUser(users.find(user => user.email_id === email));

      showSuccessToast('Document fetched successfully!');
    } catch (error) {
      console.error('Error fetching the document:', error);
      showErrorToast('Error fetching document. Please try again.');
    } finally {
      setFetchingDocument(false);
    }
  }, [fetchingDocument, users]);

  const handleVerifyUser = useCallback(async (email) => {
    if (verifyingUser) return;

    try {
      setVerifyingUser(true);

      const response = await axios.post(`${api_url}/verify-user`, { email_id: email });

      if (response.status === 200) {
        fetchUsers();
        showSuccessToast('User verified successfully!');
        setShowPopup(false);
      } else {
        showErrorToast('Error verifying user. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying the user:', error);
      showErrorToast('Error verifying user. Please try again.');
    } finally {
      setVerifyingUser(false);
    }
  }, [verifyingUser, fetchUsers]);

  const closePopup = () => {
    setShowPopup(false);
  };

  const openPdfInNewTab = () => {
    window.open(documentUrl, '_blank');
  };

  const showSuccessToast = (message) => {
    toast.success(message, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeButton: false,
      className: 'toast-success'
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeButton: false,
      className: 'toast-error'
    });
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <ToastContainer />
        <div className="main-content">
          <h1>Users</h1>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => !user.verified).map((user) => (
                <tr key={user.email_id}>
                  <td>{user.email_id}</td>
                  <td>
                    <button className="button preview-button" onClick={() => fetchDocument(user.email_id)}>Preview and Verify</button>
                  </td>
                </tr>
              ))}
              {users.filter(user => !user.verified).length === 0 && (
                <tr>
                  <td colSpan="2">No unverified users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="popup"
          >
            <div className="popup-content">
              <button className="close-button" onClick={closePopup}>&times;</button>
              {popupType === 'pdf' && (
                <div>
                  <iframe src={documentUrl} title="PDF Preview" className="pdf-preview" />
                  <button className="button download-button" onClick={openPdfInNewTab}>Download</button>
                </div>
              )}
              {popupType === 'image' && (
                <img src={documentUrl} alt="Document Preview" className="image-preview" />
              )}
              {popupType === 'unknown' && (
                <p>Unsupported document type.</p>
              )}
              {selectedUser && (
                <button className="button verify-button" onClick={() => handleVerifyUser(selectedUser.email_id)}>Verify</button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default UserVerification;
