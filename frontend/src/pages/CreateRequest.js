import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import './FormPage.css';

const CreateRequest = () => {
  const [items, setItems] = useState([]);
  const [requestItems, setRequestItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await api.get('/api/inventory', { params: { page: 0, size: 100, sortBy: 'name' } });
        setItems(response.data.content || []);
      } catch (err) {
        setError('Failed to load inventory items.');
      }
    };

    loadItems();
  }, []);

  // Prefill items from location state if passed (e.g. from Inventory page selections),
  // otherwise initialize with a single empty item row if requestItems is currently empty.
  useEffect(() => {
    if (location.state && location.state.prefilledItems) {
      setRequestItems(location.state.prefilledItems);
    } else if (requestItems.length === 0) {
      setRequestItems([{ itemId: '', itemName: '', quantity: 1 }]);
    }
  }, [location.state]);

  const addItem = () => {
    setRequestItems((prev) => [...prev, { itemId: '', itemName: '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    setRequestItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'itemId') {
        const selected = items.find((item) => String(item.id) === String(value));
        next[index].itemName = selected?.name || '';
      }
      return next;
    });
  };

  const removeItem = (index) => {
    setRequestItems((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      // Ensure there is always at least one row left
      return updated.length === 0 ? [{ itemId: '', itemName: '', quantity: 1 }] : updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!requestItems.length || (requestItems.length === 1 && !requestItems[0].itemId)) {
      setError('Please select at least one item to create a request.');
      return;
    }

    const payload = requestItems.map((row) => ({
      itemId: Number(row.itemId),
      itemName: row.itemName,
      quantity: Number(row.quantity),
    }));

    if (payload.some((row) => !row.itemId || row.quantity < 1)) {
      setError('Select valid items and quantities.');
      return;
    }

    // Client-side stock check
    for (const row of payload) {
      const matchedItem = items.find((item) => item.id === row.itemId);
      if (matchedItem && row.quantity > matchedItem.availableQuantity) {
        setError(`Requested quantity for "${row.itemName}" exceeds available stock (${matchedItem.availableQuantity} units).`);
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('/api/requests', { items: payload });
      setSuccess('Request created successfully.');
      setTimeout(() => navigate('/requests/my'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card form-card">
      <div className="page-header">
        <div>
          <h1>Create Request</h1>
          <p className="page-subtitle">Submit a new stationery request from available inventory.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="request-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="button" className="btn btn-secondary" onClick={addItem} disabled={loading}>
          ➕ Add Another Item
        </button>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Items in Request: <strong>{requestItems.filter(r => r.itemId).length}</strong>
        </span>
      </div>

      <form className="request-grid" onSubmit={handleSubmit}>
        {requestItems.map((row, index) => {
          const matchedItem = items.find((item) => String(item.id) === String(row.itemId));
          const maxQty = matchedItem ? matchedItem.availableQuantity : undefined;

          return (
            <div className="request-row" key={index}>
              <div>
                <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem', display: 'block' }}>Stationery Item</label>
                <select
                  value={row.itemId}
                  onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.availableQuantity} available)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem', display: 'block' }}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={maxQty}
                  value={row.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  disabled={loading}
                  placeholder="Qty"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={loading}
                  onClick={() => removeItem(index)}
                  style={{ width: '100%' }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;
