import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpFromLine } from 'lucide-react';
import '../../styles/Operations.css';

export default function Deliveries() {
  const { products, updateProductStock, transactions } = useData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const deliveryTransactions = transactions.filter(t => t.type === 'DELIVERY');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Delivery Orders (Outgoing Goods)</h1>
          <p>Process sales orders and log outgoing stock</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <ArrowUpFromLine size={20} />
          <span>New Delivery</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Customer/Destination</th>
              <th className="text-right">Quantity Sent</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <tbody>
            {deliveryTransactions.map(tx => {
              const product = products.find(p => p.id === tx.productId);
              return (
                <tr key={tx.id}>
                  <td>{tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : new Date(tx.date).toLocaleDateString()}</td>
                  <td className="font-medium">{product ? product.name : 'Unknown'}</td>
                  <td>{tx.destination || 'N/A'}</td>
                  <td className="text-right font-medium text-warning">-{tx.quantity}</td>
                  <td>{tx.userEmail}</td>
                </tr>
              );
            })}
            {deliveryTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted">No delivery orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DeliveryModal 
          onClose={() => setShowModal(false)} 
          products={products} 
          updateProductStock={updateProductStock}
          user={user}
        />
      )}
    </div>
  );
}

function DeliveryModal({ onClose, products, updateProductStock, user }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity) return;

    const qtyNumber = Number(quantity);
    const product = products.find(p => p.id === productId);
    
    if (product) {
      if (product.stock < qtyNumber) {
        setError(`Insufficient stock. Only ${product.stock} available.`);
        return;
      }

      const txDetails = {
        type: 'DELIVERY',
        productId,
        quantity: qtyNumber,
        destination,
        userEmail: user?.email || 'Unknown',
        notes: `Delivered ${qtyNumber} units to ${destination}`
      };
      await updateProductStock(productId, product.stock, -qtyNumber, txDetails);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2><ArrowUpFromLine className="text-primary inline-icon" /> Create Delivery Order</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        {error && <div className="auth-error" style={{marginBottom: '16px'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Product to Deliver</label>
            <select required value={productId} onChange={e => { setProductId(e.target.value); setError(''); }}>
              <option value="" disabled>-- Select a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.name} ({p.stock} available)</option>
              ))}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Quantity to Send</label>
              <input required type="number" min="1" value={quantity} onChange={e => { setQuantity(e.target.value); setError(''); }} />
            </div>
            <div className="form-group">
              <label>Customer Name / Destination</label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. John Doe / Store #4" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Confirm Delivery</button>
          </div>
        </form>
      </div>
    </div>
  );
}
