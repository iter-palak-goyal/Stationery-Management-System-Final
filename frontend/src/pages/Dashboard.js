import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalRequests: 0,
    pendingRequests: 0,
    myRequests: 0,
  });

  // State for detailed component views
  const [lowStockItems, setLowStockItems] = useState([]);
  const [pendingRequestsList, setPendingRequestsList] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCard, setSelectedCard] = useState(''); // 'low-stock', 'pending-requests', 'inventory'

  const loadStatsAndDetails = async () => {
    setLoading(true);
    setError('');

    try {
      let lowStockList = [];
      let pendingRequestsList = [];
      let inventoryList = [];

      // Fetch first page of inventory to show snapshot list
      const inventoryResponse = await api.get('/api/inventory', {
        params: { page: 0, size: 20, sortBy: 'name' },
      });
      inventoryList = inventoryResponse.data?.content || [];
      const totalItems = inventoryResponse.data?.totalElements ?? 0;

      if (user?.role === 'ADMIN') {
        // Fetch low-stock items list
        const lowResponse = await api.get('/api/inventory/low-stock');
        lowStockList = lowResponse.data || [];

        // Fetch requests to filter pending
        const allRequests = await api.get('/api/requests');
        const reqList = allRequests.data || [];
        pendingRequestsList = reqList.filter((request) => request.status === 'PENDING');

        setStats({
          totalItems,
          lowStock: lowStockList.length,
          totalRequests: reqList.length,
          pendingRequests: pendingRequestsList.length,
          myRequests: 0,
        });
        setLowStockItems(lowStockList);
        setPendingRequestsList(pendingRequestsList);
        setInventoryItems(inventoryList);

        // Auto-select card details based on priority
        if (lowStockList.length > 0) {
          setSelectedCard('low-stock');
        } else if (pendingRequestsList.length > 0) {
          setSelectedCard('pending-requests');
        } else {
          setSelectedCard('inventory');
        }
      } else {
        // Fetch student's requests
        const myResponse = await api.get('/api/requests/my');
        const myReqList = myResponse.data || [];
        pendingRequestsList = myReqList.filter((request) => request.status === 'PENDING');

        setStats({
          totalItems,
          lowStock: 0,
          totalRequests: 0,
          pendingRequests: pendingRequestsList.length,
          myRequests: myReqList.length,
        });
        setPendingRequestsList(pendingRequestsList);
        setInventoryItems(inventoryList);

        // Auto-select card details
        if (pendingRequestsList.length > 0) {
          setSelectedCard('pending-requests');
        } else {
          setSelectedCard('inventory');
        }
      }
    } catch (err) {
      setError('Unable to load dashboard stats and details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatsAndDetails();
  }, [user?.role]);

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">
            {user?.role === 'ADMIN'
              ? 'Admin overview of inventory and request activity.'
              : 'Student overview of inventory and your requests.'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card-grid">
        {/* Inventory Items Card */}
        <div
          className={`stat-card ${selectedCard === 'inventory' ? 'active-card' : ''}`}
          onClick={() => setSelectedCard('inventory')}
        >
          <div className="stat-label">Inventory Items</div>
          <div className="stat-value">{stats.totalItems}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Click to view list preview
          </div>
        </div>

        {user?.role === 'ADMIN' ? (
          <>
            {/* Low Stock Items Card */}
            <div
              className={`stat-card ${selectedCard === 'low-stock' ? 'active-card' : ''}`}
              onClick={() => setSelectedCard('low-stock')}
            >
              <div className="stat-label">Low Stock Items</div>
              <div className="stat-value" style={{ color: stats.lowStock > 0 ? '#dc2626' : 'inherit' }}>
                {stats.lowStock}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Click to view alerts
              </div>
            </div>

            {/* Total Requests Card */}
            <div
              className="stat-card"
              onClick={() => setSelectedCard('pending-requests')}
            >
              <div className="stat-label">Total Requests</div>
              <div className="stat-value">{stats.totalRequests}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Click to view queue
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Student requests */}
            <div
              className="stat-card"
              onClick={() => setSelectedCard('pending-requests')}
            >
              <div className="stat-label">My Requests</div>
              <div className="stat-value">{stats.myRequests}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Click to view pending
              </div>
            </div>
          </>
        )}

        {/* Pending Requests Card */}
        <div
          className={`stat-card ${selectedCard === 'pending-requests' ? 'active-card' : ''}`}
          onClick={() => setSelectedCard('pending-requests')}
        >
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value">{stats.pendingRequests}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Click to view queue
          </div>
        </div>
      </div>

      {loading && <div className="page-loading">Loading dashboard details...</div>}

      {/* Details Section based on selected card */}
      {!loading && selectedCard && (
        <div style={{ marginTop: '2.5rem', animation: 'fadeIn 0.3s ease' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-medium)', marginBottom: '1.5rem' }} />

          {selectedCard === 'low-stock' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ Low Stock Alerts <span className="status-badge rejected">{stats.lowStock} items</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                These items are currently running below their minimum stock levels. Restock immediately.
              </p>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Quantity Left</th>
                      <th>Min Limit</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length ? (
                      lowStockItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.category}</td>
                          <td style={{ color: '#dc2626', fontWeight: 700 }}>{item.availableQuantity}</td>
                          <td>{item.minimumQuantity}</td>
                          <td><span className="status-badge pending">{item.unit}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="empty-row">No low stock items. All inventory is fully restocked!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedCard === 'pending-requests' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⏳ Pending Request Queue <span className="status-badge pending">{stats.pendingRequests} requests</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                {user?.role === 'ADMIN'
                  ? 'Active student requests currently awaiting admin review.'
                  : 'Your submitted requests currently awaiting approval.'}
              </p>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Request ID</th>
                      {user?.role === 'ADMIN' && <th>Student</th>}
                      <th>Items Requested</th>
                      <th>Requested On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequestsList.length ? (
                      pendingRequestsList.map((req) => (
                        <tr key={req.id}>
                          <td>{req.id}</td>
                          <td><code style={{ fontSize: '0.85rem' }}>{req.requestId}</code></td>
                          {user?.role === 'ADMIN' && <td><strong>{req.studentUsername}</strong></td>}
                          <td>{req.items?.map((it) => `${it.itemName} x${it.quantity}`).join(', ')}</td>
                          <td>{new Date(req.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={user?.role === 'ADMIN' ? 5 : 4} className="empty-row">No pending requests. Queue is clear!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedCard === 'inventory' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📦 Inventory Snapshot <span className="status-badge approved">Directory Preview</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                A quick preview of directory items currently cataloged in the inventory databases.
              </p>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Stock Level</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.length ? (
                      inventoryItems.slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.category}</td>
                          <td>
                            <span style={{
                              color: item.availableQuantity <= item.minimumQuantity ? '#dc2626' : 'var(--text-primary)',
                              fontWeight: 700
                            }}>
                              {item.availableQuantity}
                            </span>
                            {item.availableQuantity <= item.minimumQuantity && ' (Low)'}
                          </td>
                          <td>{item.unit}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-row">No stationery items found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                <Link to="/inventory" className="btn btn-secondary btn-sm">Go to Full Inventory →</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
