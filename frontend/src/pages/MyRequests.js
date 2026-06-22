import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import './Requests.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/requests/my', {
        params: status ? { status } : {},
      });
      setRequests(response.data || []);
    } catch (err) {
      setError('Failed to load your requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  // Client-side sorting for rapid responsiveness
  const sortedRequests = [...requests].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === 'date-asc') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    } else if (sortBy === 'name-asc') {
      const nameA = a.items?.[0]?.itemName || '';
      const nameB = b.items?.[0]?.itemName || '';
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'name-desc') {
      const nameA = a.items?.[0]?.itemName || '';
      const nameB = b.items?.[0]?.itemName || '';
      return nameB.localeCompare(nameA);
    }
    return 0;
  });

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>My Requests</h1>
          <p className="page-subtitle">Track, filter, and sort requests you have submitted.</p>
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
              <option value="name-asc">First Item Name (A-Z)</option>
              <option value="name-desc">First Item Name (Z-A)</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Request ID</th>
              <th>Status / Reason</th>
              <th>Items Requested</th>
              <th>Approving Admin</th>
              <th>Submitted On</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.length ? (
              sortedRequests.map((request) => (
                <tr key={request.id}>
                  <td><strong>#{request.id}</strong></td>
                  <td><code style={{ fontSize: '0.85rem' }}>{request.requestId}</code></td>
                  <td>
                    <span className={`status-badge ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <div className="rejection-reason-box" style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#f87171', maxWidth: '250px', lineBreak: 'anywhere' }}>
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
                  <td>{request.adminUsername || '—'}</td>
                  <td>{request.createdAt ? new Date(request.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-row">
                  {loading ? 'Loading requests...' : 'No requests found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRequests;
