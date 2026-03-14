import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, ArrowDownToLine } from 'lucide-react';
import '../../styles/Operations.css';

export default function Receipts() {
  const { products, updateProductStock, transactions } = useData();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const vendorIdParam = searchParams.get('vendorId');
  const [showModal, setShowModal] = useState(false);

  let receiptTransactions = transactions.filter(t => t.type === 'RECEIPT');
  if (vendorIdParam) {
    receiptTransactions = receiptTransactions.filter(t => t.vendorId === vendorIdParam);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Receipts (Incoming Goods)</h1>
          <p>Receive POs and log incoming stock</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-success">
          <Plus size={20} />
          <span>New Receipt</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Supplier</th>
              <th className="text-right">Quantity Rcvd</th>
              <th>Received By</th>
            </tr>
          </thead>
          <tbody>
            {receiptTransactions.map(tx => {
              const product = products.find(p => p.id === tx.productId);
              return (
                <tr key={tx.id}>
                  <td>{tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : new Date(tx.date).toLocaleDateString()}</td>
                  <td className="font-medium">{product ? product.name : 'Unknown'}</td>
                  <td>{tx.supplier || 'N/A'}</td>
                  <td className="text-right font-medium text-success">+{tx.quantity}</td>
                  <td>{tx.userEmail}</td>
                </tr>
              );
            })}
            {receiptTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted">No receipts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ReceiptModal 
          onClose={() => setShowModal(false)} 
          products={products} 
          updateProductStock={updateProductStock}
          user={user}
        />
      )}
    </div>
  );
}

function ReceiptModal({ onClose, products, updateProductStock, user }) {
  const { vendors } = useData();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [vendorId, setVendorId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity) return;

    const qtyNumber = Number(quantity);
    const product = products.find(p => p.id === productId);
    const vendor = vendors?.find(v => v.id === vendorId);
    
    if (product) {
      const txDetails = {
        type: 'RECEIPT',
        productId,
        quantity: qtyNumber,
        vendorId: vendor ? vendor.id : null,
        supplier: vendor ? vendor.name : 'Unknown',
        userEmail: user?.email || 'Unknown',
        notes: `Received ${qtyNumber} units from ${vendor ? vendor.name : 'Unknown'}`
      };
      await updateProductStock(productId, product.stock, qtyNumber, txDetails);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2><ArrowDownToLine className="text-success inline-icon" /> Receive Stock</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Product</label>
            <select required value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="" disabled>-- Select a product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} - {p.name} ({p.stock} on hand)</option>
              ))}
            </select>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Quantity Received</label>
              <input required type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Supplier / Vendor</label>
              <select value={vendorId} onChange={e => setVendorId(e.target.value)}>
                <option value="">-- No Vendor selected --</option>
                {vendors?.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-success">Validate Receipt</button>
          </div>
        </form>
      </div>
    </div>
  );
}
