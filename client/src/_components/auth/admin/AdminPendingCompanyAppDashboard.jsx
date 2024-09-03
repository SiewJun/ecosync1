import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPendingCompanyAppDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/pending-applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setApplications(response.data.applications);
      } catch (error) {
        setError(error.response.data.message || 'An error occurred');
      }
    };

    fetchApplications();
  }, []);

  return (
    <div>
      <h1>Pending Applications</h1>
      {error && <p className="text-red-500">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.companyName}</td>
              <td>{app.email}</td>
              <td>{app.phoneNumber}</td>
              <td>{app.status}</td>
              <td>
                <button onClick={() => handleReview(app.id, 'Approved')}>Approve</button>
                <button onClick={() => handleReview(app.id, 'Rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const handleReview = async (id, status) => {
  try {
    await axios.post(`http://localhost:5000/api/auth/review-application/${id}`, { status }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    // Refresh the application list
    window.location.reload();
  } catch (error) {
    console.error('Error reviewing application:', error);
  }
};

export default AdminPendingCompanyAppDashboard;
