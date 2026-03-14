import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw } from 'lucide-react';
import '../../styles/Operations.css';

export default function Transfers() {
  const { products, transactions, logTransaction } = useData(); // We will need logTransaction exposed
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const transferTransactions = transactions.filter(t => t.type === 'TRANSFER');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Internal Transfers</h1>
          <p>Move stock between locations within your organization.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <RefreshCw size={20} />
          <span>New Transfer</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>From Location</th>
              <th>To Location</th>
              <th className="text-right">Quantity Moved</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <tbody>
            {transferTransactions.map(tx => {
              const product = products.find(p => p.id === tx.productId);
              return (
                <tr key={tx.id}>
                  <td>{tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : new Date(tx.date).toLocaleDateString()}</td>
                  <td className="font-medium">{product ? product.name : 'Unknown'}</td>
                  <td>{tx.fromLocation}</td>
                  <td>{tx.toLocation}</td>
                  <td className="text-right font-medium">{tx.quantity}</td>
                  <td>{tx.userEmail}</td>
                </tr>
              );
            })}
            {transferTransactions.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-muted">No internal transfers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TransferModal 
          onClose={() => setShowModal(false)} 
          products={products} 
          logTransaction={logTransaction}
          user={user}
        />
      )}
    </div>
  );
}

function TransferModal({ onClose, products, logTransaction, user }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [error, setError] = useState('');

  // We are simulating location movements. So total stock doesn't change, we just log it.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || !fromLocation || !toLocation) return;

    const qtyNumber = Number(quantity);
    const product = products.find(p => p.id === productId);
    
    if (product) {
      if (product.stock < qtyNumber) {
        setError(`Insufficient total stock context to move ${qtyNumber}.`);
        // We'll let them submit it anyway with a soft warning, or block it. Let's block it for logic.
        return;
      }

      if (logTransaction) {
        const txDetails = {
          type: 'TRANSFER',
          productId,
          quantity: qtyNumber,
          fromLocation,
          toLocation,
          userEmail: user?.email || 'Unknown',
          notes: `Moved ${qtyNumber} units from ${fromLocation} to ${toLocation}`
        };
        await logTransaction(txDetails);
      }
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2><RefreshCw className="text-primary inline-icon" /> Run Internal Transfer</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        {error && <div className="auth-error" style={{marginBottom: '16px'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Product to Move</label>
            <select required value={productId} onChange={e => { setProductId(e.target.value); setError(''); }}>
              <option value="" disabled>-- Select a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.name} ({p.stock} total avail)</option>
              ))}
            </select>
          </div>
          <div className="form-grid">
             <div className="form-group">
              <label>From Location</label>
              <input required type="text" value={fromLocation} onChange={e => setFromLocation(e.target.value)} placeholder="e.g. Warehouse A" />
            </div>
            <div className="form-group">
              <label>To Location</label>
              <input required type="text" value={toLocation} onChange={e => setToLocation(e.target.value)} placeholder="e.g. Rack 3 / Prod Floor" />
            </div>
          </div>
          <div className="form-group">
              <label>Quantity to Move</label>
              <input required type="number" min="1" value={quantity} onChange={e => { setQuantity(e.target.value); setError(''); }} />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Confirm Transfer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
