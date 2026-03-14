import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Phone, Mail, ArrowDownToLine } from 'lucide-react';
import '../../styles/Products.css';

export default function Vendors() {
  const { vendors } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const filteredVendors = vendors.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Vendors</h1>
          <p>Manage your suppliers and vendor contacts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} />
          <span>New Vendor</span>
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search vendors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map(vendor => (
              <tr key={vendor.id}>
                <td className="font-medium">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} className="text-muted" />
                    {vendor.name}
                  </div>
                </td>
                <td>{vendor.contactPerson || '-'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} className="text-muted" />
                    {vendor.phone || '-'}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} className="text-muted" />
                    {vendor.email || '-'}
                  </div>
                </td>
                <td className="text-right">
                  <button 
                    onClick={() => navigate(`/receipts?vendorId=${vendor.id}`)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '14px' }}
                  >
                    <ArrowDownToLine size={16} style={{ marginRight: '6px' }} />
                    View Receipts
                  </button>
                </td>
              </tr>
            ))}
            {filteredVendors.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && <VendorModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function VendorModal({ onClose }) {
  const { addVendor } = useData();
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addVendor(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2><Building2 className="inline-icon text-primary" /> Create New Vendor</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vendor / Company Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Corp" />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="e.g. John Doe" />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="555-0199" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="orders@acme.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
              placeholder="Full address details"
              rows={3}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--background)', color: 'var(--text)' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}
