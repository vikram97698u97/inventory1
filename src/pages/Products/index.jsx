import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Search, Filter } from 'lucide-react';
import PredictorCard from '../../components/PredictorCard';
import '../../styles/Products.css';

export default function Products() {
  const { products, transactions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory catalog</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} />
          <span>New Product</span>
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary">
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>UoM</th>
              <th className="text-right">On Hand</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td className="font-mono">{product.sku}</td>
                <td className="font-medium">{product.name}</td>
                <td><span className="badge">{product.category}</span></td>
                <td>{product.uom}</td>
                <td className={`text-right font-medium ${product.stock < 10 ? 'text-danger' : ''}`}>
                  {product.stock}
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Smart Stock Predictions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {filteredProducts.map(product => (
            <PredictorCard key={product.id} product={product} movements={transactions} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-muted" style={{ padding: '16px' }}>No products available for prediction.</div>
          )}
        </div>
      </div>

      {showModal && <ProductModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function ProductModal({ onClose }) {
  const { addProduct } = useData();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    uom: 'Units',
    initialStock: 0,
    supplyType: 'sourced',
    vendorName: '',
    vendorEmail: '',
    vendorPhone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addProduct({
      ...formData,
      initialStock: Number(formData.initialStock)
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>Create New Product</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>SKU / Code</label>
              <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>General</option>
                <option>Raw Material</option>
                <option>Furniture</option>
                <option>Electronics</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Unit of Measure</label>
              <select value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})}>
                <option>Units</option>
                <option>kg</option>
                <option>pcs</option>
                <option>meters</option>
              </select>
            </div>
            <div className="form-group">
              <label>Initial Stock (Optional)</label>
              <input type="number" min="0" value={formData.initialStock} onChange={e => setFormData({...formData, initialStock: e.target.value})} />
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--background)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>Supply Chain Details</h3>
            <div className="form-group">
              <label>Supply Type</label>
              <select value={formData.supplyType} onChange={e => setFormData({...formData, supplyType: e.target.value})}>
                <option value="sourced">Sourced from Vendor</option>
                <option value="manufactured">Manufactured In-House</option>
              </select>
            </div>
            
            {formData.supplyType === 'sourced' && (
              <div className="form-grid" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <label>Vendor Name</label>
                  <input type="text" value={formData.vendorName} onChange={e => setFormData({...formData, vendorName: e.target.value})} placeholder="e.g. Acme Corp" />
                </div>
                <div className="form-group">
                  <label>Vendor Email</label>
                  <input type="email" value={formData.vendorEmail} onChange={e => setFormData({...formData, vendorEmail: e.target.value})} placeholder="orders@acme.com" />
                </div>
                <div className="form-group">
                  <label>Vendor Phone</label>
                  <input type="text" value={formData.vendorPhone} onChange={e => setFormData({...formData, vendorPhone: e.target.value})} placeholder="555-0199" />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
