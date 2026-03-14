import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Search, Filter } from 'lucide-react';
import '../../styles/Products.css';

export default function Products() {
  const { products } = useData();
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
    initialStock: 0
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
      <div className="modal-content">
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
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
