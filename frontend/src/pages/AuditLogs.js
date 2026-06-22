import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import './AuditLogs.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering and Searching states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/requests/audit-logs');
      setLogs(response.data || []);
    } catch (err) {
      setError('Failed to fetch audit logs. Please make sure you are logged in as an Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter ? log.role === roleFilter : true;
    const matchesAction = actionFilter ? log.action === actionFilter : true;

    return matchesSearch && matchesRole && matchesAction;
  });

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = new Date(a.actionDate || 0);
    const dateB = new Date(b.actionDate || 0);
    return sortBy === 'date-desc' ? dateB - dateA : dateA - dateB;
  });

  const getActionBadgeClass = (action) => {
    if (!action) return '';
    if (action.includes('CREATE_REQUEST')) return 'action-create-request';
    if (action.includes('APPROVE')) return 'action-approve';
    if (action.includes('REJECT')) return 'action-reject';
    if (action.includes('FULFILL')) return 'action-fulfill';
    if (action.includes('LOGIN')) return 'action-login';
    if (action.includes('REGISTER')) return 'action-register';
    if (action.includes('CREATE_ITEM')) return 'action-create-item';
    if (action.includes('UPDATE')) return 'action-update';
    if (action.includes('DELETE')) return 'action-delete';
    return 'action-default';
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>🛡️ System Audit Logs</h1>
          <p className="page-subtitle">Track student & admin actions, resource modifications, status transitions, and audit reasons.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadAuditLogs} disabled={loading}>
          🔄 Refresh Logs
        </button>
      </div>

      {/* Control panel for filters, search, and sorting */}
      <div className="audit-controls-grid">
        <div className="control-group search-group">
          <label htmlFor="search">Search</label>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="search"
              type="text"
              placeholder="Search user, action, request ID, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="control-group">
          <label htmlFor="role-filter">User Role</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin Only</option>
            <option value="STUDENT">Student Only</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="action-filter">Action Type</label>
          <select
            id="action-filter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="CREATE_REQUEST">Create Request</option>
            <option value="APPROVE_REQUEST">Approve Request</option>
            <option value="REJECT_REQUEST">Reject Request</option>
            <option value="FULFILLED_REQUEST">Fulfill Request</option>
            <option value="CREATE_ITEM">Add Inventory Item</option>
            <option value="UPDATE_ITEM">Update Inventory Item</option>
            <option value="DELETE_ITEM">Delete Inventory Item</option>
            <option value="LOGIN">User Login</option>
            <option value="REGISTER">User Registration</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort-order">Sort Order</label>
          <select
            id="sort-order"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Info</th>
              <th>Action</th>
              <th>Request ID Reference</th>
              <th>Details of Change</th>
              <th>Reason ("Why")</th>
              <th>Created Date</th>
              <th>Updated Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.length ? (
              sortedLogs.map((log) => (
                <tr key={log.id} className="audit-log-row">
                  <td><strong>#{log.id}</strong></td>
                  <td>
                    <div className="audit-user-cell">
                      <span className="audit-username">{log.username}</span>
                      <span className={`audit-role-badge ${log.role?.toLowerCase()}`}>
                        {log.role}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`audit-action-badge ${getActionBadgeClass(log.action)}`}>
                      {log.action?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {log.requestId ? (
                      <code className="audit-request-id">{log.requestId.slice(0, 8)}...</code>
                    ) : (
                      <span className="not-applicable">—</span>
                    )}
                  </td>
                  <td>
                    <div className="audit-details-cell" title={log.details}>
                      {log.details || <span className="not-applicable">—</span>}
                    </div>
                  </td>
                  <td>
                    <div className="audit-reason-cell" title={log.reason}>
                      {log.reason || <span className="not-applicable">—</span>}
                    </div>
                  </td>
                  <td className="date-cell">
                    {log.actionDate ? new Date(log.actionDate).toLocaleString() : '—'}
                  </td>
                  <td className="date-cell">
                    {log.updatedDate ? new Date(log.updatedDate).toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-row">
                  {loading ? 'Fetching audit trail...' : 'No matching audit records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
