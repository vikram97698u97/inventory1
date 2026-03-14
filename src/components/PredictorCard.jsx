import { useState } from 'react';
import { predictStockout } from '../utils/predictStock';
import { Package, TrendingDown, Clock, Factory, Truck } from 'lucide-react';

export default function PredictorCard({ product, movements }) {
  const prediction = predictStockout(product, movements);
  const [successMsg, setSuccessMsg] = useState('');

  const getStatusColor = (status) => {
    switch(status) {
      case 'safe': return 'var(--success, #22c55e)';
      case 'low': return 'var(--warning, #eab308)';
      case 'warning': return '#f97316'; // orange
      case 'critical': return 'var(--danger, #ef4444)';
      case 'no_data': return 'var(--text-muted, #94a3b8)';
      default: return 'var(--text-muted, #94a3b8)';
    }
  };

  const handleOrder = () => {
    setSuccessMsg('Restock order sent successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleProduction = () => {
    setSuccessMsg('Production Scheduled');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${getStatusColor(prediction.status)}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} />
          {product.name}
        </h3>
        <span style={{
          backgroundColor: `${getStatusColor(prediction.status)}20`,
          color: getStatusColor(prediction.status),
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {prediction.status.replace('_', ' ')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Stock</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{product.stock}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><TrendingDown size={12} className="inline-icon" /> Avg Daily Usage</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{prediction.avgDailyRate}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}><Clock size={12} className="inline-icon" /> Days Remaining</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {prediction.daysRemaining !== null ? prediction.daysRemaining : 'N/A'}
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: 'var(--success)', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
          {successMsg}
        </div>
      )}

      {prediction.status !== 'no_data' && product.supplyType === 'manufactured' && (
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Factory size={16} /> Production Alert</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
            Est. Stockout: <strong>{prediction.estimatedStockoutDate?.toLocaleDateString()}</strong><br/>
            Start production by: <strong>{prediction.startProductionBy?.toLocaleDateString()}</strong>
          </p>
          <button onClick={handleProduction} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Production Scheduled</button>
        </div>
      )}

      {prediction.status !== 'no_data' && product.supplyType === 'sourced' && (
        <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Truck size={16} /> Restock Recommendation</h4>
          <div style={{ fontSize: '13px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <div>Qty Needed: <strong>{prediction.quantityNeeded}</strong></div>
            <div>Order By: <strong>{prediction.suggestedOrderDate?.toLocaleDateString()}</strong></div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Vendor: {prediction.vendorName} ({prediction.vendorEmail} | {prediction.vendorPhone})
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleOrder} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Send Restock Order</button>
            <button onClick={() => setSuccessMsg('Offline Restock Noted')} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Restocked Offline</button>
          </div>
        </div>
      )}
    </div>
  );
}
