import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import './Inventory.css';

const Inventory = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      const url = search ? '/api/inventory/search' : '/api/inventory';
      const response = search
        ? await api.get(url, { params: { keyword: search } })
        : await api.get(url, { params: { page, size, sortBy: 'name' } });

      if (search) {
        setItems(response.data || []);
        setTotal(response.data?.length ?? 0);
      } else {
        setItems(response.data?.content || []);
        setTotal(response.data?.totalElements ?? 0);
      }
    } catch (err) {
      setError('Failed to load inventory.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedItemIds(new Set());
    loadItems();
  }, [page, size]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSelectedItemIds(new Set());
    await loadItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this stationery item? This action cannot be undone.')) {
      try {
        await api.delete(`/api/inventory/${id}`);
        setError('');
        loadItems();
      } catch (err) {
        setError('Failed to delete item. It might be referenced in active requests.');
      }
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const availableIds = items
        .filter((item) => item.availableQuantity > 0)
        .map((item) => item.id);
      setSelectedItemIds(new Set(availableIds));
    } else {
      setSelectedItemIds(new Set());
    }
  };

  const handleRequestSingle = (item) => {
    navigate('/requests/new', {
      state: {
        prefilledItems: [{
          itemId: item.id,
          itemName: item.name,
          quantity: 1,
          availableQuantity: item.availableQuantity
        }]
      }
    });
  };

  const handleRequestSelected = () => {
    const selectedList = items
      .filter((item) => selectedItemIds.has(item.id))
      .map((item) => ({
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        availableQuantity: item.availableQuantity
      }));
    navigate('/requests/new', { state: { prefilledItems: selectedList } });
  };

  const availableItemsOnPage = items.filter((item) => item.availableQuantity > 0);
  const isAllSelected = availableItemsOnPage.length > 0 && availableItemsOnPage.every((item) => selectedItemIds.has(item.id));

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="page-subtitle">Browse stationery items and search by name.</p>
        </div>
        {isAdmin() ? (
          <div className="page-actions">
            <Link to="/inventory/add" className="btn btn-primary">
              Add New Item
            </Link>
          </div>
        ) : (
          <div className="page-actions" style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleRequestSelected}
              className="btn btn-primary"
              disabled={selectedItemIds.size === 0}
            >
              📝 Request Selected ({selectedItemIds.size})
            </button>
            <Link to="/requests/new" className="btn btn-secondary">
              ✏️ Custom Request
            </Link>
          </div>
        )}
      </div>

      <form className="page-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search items by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-search"
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {!isAdmin() && (
                <th style={{ width: '50px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </th>
              )}
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Qty</th>
              <th>Unit</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={item.id}>
                  {!isAdmin() && (
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedItemIds.has(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        disabled={item.availableQuantity <= 0}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  <td>{item.id}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>
                    <span style={{
                      color: item.availableQuantity <= 0 ? '#dc2626' : (item.availableQuantity <= item.minimumQuantity ? '#d97706' : 'inherit'),
                      fontWeight: 700
                    }}>
                      {item.availableQuantity}
                    </span>
                    {item.availableQuantity <= 0 ? (
                      <span className="status-badge rejected" style={{ marginLeft: '0.5rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>Out of Stock</span>
                    ) : item.availableQuantity <= item.minimumQuantity ? (
                      <span className="status-badge pending" style={{ marginLeft: '0.5rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>Low Stock</span>
                    ) : null}
                  </td>
                  <td>{item.minimumQuantity}</td>
                  <td>{item.unit}</td>
                  <td>{item.description || '—'}</td>
                  <td>
                    {isAdmin() ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/inventory/edit/${item.id}`} className="btn btn-sm btn-secondary">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequestSingle(item)}
                        className="btn btn-sm btn-primary"
                        disabled={item.availableQuantity <= 0}
                      >
                        Request
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin() ? "8" : "9"} className="empty-row">
                  {loading ? 'Loading items...' : 'No items found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!search && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </button>
          <span>
            Page {page + 1} • {total} items
          </span>
          <button
            className="pagination-btn"
            disabled={(page + 1) * size >= total}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
