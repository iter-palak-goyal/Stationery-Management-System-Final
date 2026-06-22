import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import './Requests.css';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Rejection modal states
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/requests', {
        params: status ? { status } : {},
      });
      setRequests(response.data || []);
    } catch (err) {
      setError('Failed to load requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  const updateRequest = async (id, action) => {
    setMessage('');
    setError('');
    if (action === 'reject') {
      setRejectingId(id);
      setRejectionReason('');
      return;
    }
    try {
      const url = `/api/requests/${id}/${action}`;
      await api.put(url);
      setMessage(`Request ${action}ed successfully.`);
      loadRequests();
    } catch (err) {
      setError(`Failed to ${action} request.`);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setMessage('');
    setError('');
    try {
      const url = `/api/requests/${rejectingId}/reject`;
      await api.put(url, { rejectionReason });
      setMessage(`Request rejected successfully.`);
      setRejectingId(null);
      setRejectionReason('');
      loadRequests();
    } catch (err) {
      setError(`Failed to reject request.`);
    }
  };

  // Client-side sorting for responsiveness
  const sortedRequests = [...requests].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === 'date-asc') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (sortBy === 'name-asc') {
      const nameA = a.studentUsername || '';
      const nameB = b.studentUsername || '';
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'name-desc') {
      const nameA = a.studentUsername || '';
      const nameB = b.studentUsername || '';
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>Manage Requests</h1>
          <p className="page-subtitle">Approve, reject, or fulfill student requests. Filter and sort below.</p>
        </div>
      </div>

      <div className="filters-container" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className="request-filter" style={{ flex: '1', minWidth: '200px' }}>
          <label>
            <span>🔍 Filter by status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FULFILLED">Fulfilled</option>
            </select>
          </label>
        </div>

        <div className="request-filter" style={{ flex: '1', minWidth: '200px' }}>
          <label>
            <span>↕️ Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="name-asc">Student Name (A-Z)</option>
              <option value="name-desc">Student Name (Z-A)</option>
            </select>
          </label>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Request ID</th>
              <th>Student Name</th>
              <th>Status</th>
              <th>Items Requested</th>
              <th>Requested On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.length ? (
              sortedRequests.map((request) => (
                <tr key={request.id}>
                  <td><strong>#{request.id}</strong></td>
                  <td><code style={{ fontSize: '0.85rem' }}>{request.requestId}</code></td>
                  <td><strong>{request.studentUsername}</strong></td>
                  <td>
                    <span className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#f87171', maxWidth: '250px', lineBreak: 'anywhere' }}>
                        <strong>Reason:</strong> {request.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {request.items?.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.9rem' }}>
                          📦 {item.itemName} <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>x{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{request.createdAt ? new Date(request.createdAt).toLocaleString() : '—'}</td>
                  <td className="action-cell">
                    {request.status === 'PENDING' && (
                      <>
                        <button className="action-btn approve" onClick={() => updateRequest(request.id, 'approve')}>
                          Approve
                        </button>
                        <button className="action-btn reject" onClick={() => updateRequest(request.id, 'reject')}>
                          Reject
                        </button>
                      </>
                    )}
                    {request.status === 'APPROVED' && (
                      <button className="action-btn fulfill" onClick={() => updateRequest(request.id, 'fulfill')}>
                        Fulfill
                      </button>
                    )}
                    {request.status !== 'PENDING' && request.status !== 'APPROVED' && '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-row">
                  {loading ? 'Loading requests...' : 'No requests found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Rejection Modal overlay */}
      {rejectingId && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Reject Request</h2>
            <p className="modal-subtitle">Please specify the reason for rejecting this request.</p>
            <form onSubmit={handleRejectSubmit} className="modal-form">
              <textarea
                placeholder="Type rejection reason here (e.g. Budget limit exceeded, Item discontinued)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                autoFocus
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRequests;
