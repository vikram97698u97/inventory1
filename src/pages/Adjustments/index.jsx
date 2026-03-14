import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Settings } from 'lucide-react';
import '../../styles/Operations.css';

export default function Adjustments() {
  const { products, updateProductStock, transactions } = useData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const adjustmentTransactions = transactions.filter(t => t.type === 'ADJUSTMENT');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Stock Adjustments</h1>
          <p>Reconcile physical counts with recorded stock numbers.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-warning">
          <Settings size={20} />
          <span>New Adjustment</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th className="text-right">Difference</th>
              <th>Reason</th>
              <th>Adjusted By</th>
            </tr>
          </thead>
          <tbody>
            {adjustmentTransactions.map(tx => {
              const product = products.find(p => p.id === tx.productId);
              const txDiff = Number(tx.quantity);
              return (
                <tr key={tx.id}>
                  <td>{tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : new Date(tx.date).toLocaleDateString()}</td>
                  <td className="font-medium">{product ? product.name : 'Unknown'}</td>
                  <td className={`text-right font-medium ${txDiff > 0 ? 'text-success' : 'text-danger'}`}>
                    {txDiff > 0 ? '+' : ''}{txDiff}
                  </td>
                  <td>{tx.notes}</td>
                  <td>{tx.userEmail}</td>
                </tr>
              );
            })}
            {adjustmentTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted">No inventory adjustments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AdjustmentModal 
          onClose={() => setShowModal(false)} 
          products={products} 
          updateProductStock={updateProductStock}
          user={user}
        />
      )}
    </div>
  );
}

function AdjustmentModal({ onClose, products, updateProductStock, user }) {
  const [productId, setProductId] = useState('');
  const [countedQty, setCountedQty] = useState('');
  const [reason, setReason] = useState('');
  
  const product = products.find(p => p.id === productId);
  const diff = product && countedQty ? Number(countedQty) - product.stock : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || countedQty === '') return;

    if (product && diff !== 0) {
      const txDetails = {
        type: 'ADJUSTMENT',
        productId,
        quantity: diff,
        counted: Number(countedQty),
        userEmail: user?.email || 'Unknown',
        notes: reason || `Adjusted stock by ${diff > 0 ? '+' : ''}${diff}`
      };
      await updateProductStock(productId, product.stock, diff, txDetails);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2><Settings className="text-warning inline-icon" /> Stock Adjustment</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Product</label>
            <select required value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="" disabled>-- Select a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.name} (Current: {p.stock})</option>
              ))}
            </select>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Counted Quantity (Actual Physical)</label>
              <input required type="number" min="0" value={countedQty} onChange={e => setCountedQty(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Difference</label>
              {product && countedQty !== '' ? (
                <div style={{ padding: '12px 16px', fontWeight: 'bold', color: diff > 0 ? 'var(--success)' : (diff < 0 ? 'var(--danger)' : 'var(--text-main)') }}>
                  {diff > 0 ? '+' : ''}{diff} units
                </div>
              ) : (
                <div style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>-</div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Reason for Adjustment (Optional)</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Found damaged stock / recount" />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-warning" disabled={!product || countedQty === '' || diff === 0}>Validate Count</button>
          </div>
        </form>
      </div>
    </div>
  );
}
