import { useData } from '../../context/DataContext';
import '../../styles/Dashboard.css';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function Dashboard() {
  const { products, transactions } = useData();

  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
  const pendingReceipts = transactions.filter(t => t.type === 'RECEIPT').length;
  const pendingDeliveries = transactions.filter(t => t.type === 'DELIVERY').length;

  const kpis = [
    { title: 'Total Products', value: totalProducts, icon: Package, color: 'blue' },
    { title: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'orange' },
    { title: 'Receipts Logged', value: pendingReceipts, icon: ArrowDownToLine, color: 'green' },
    { title: 'Deliveries Logged', value: pendingDeliveries, icon: ArrowUpFromLine, color: 'purple' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your inventory today.</p>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`kpi-card ${kpi.color}`}>
              <div className="kpi-icon-wrapper">
                <Icon size={24} />
              </div>
              <div className="kpi-content">
                <h3>{kpi.title}</h3>
                <h2>{kpi.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content">
        <div className="card recent-activity">
          <h3>Recent Activity</h3>
          <div className="placeholder-content">
            <p>Activity feed will appear here...</p>
          </div>
        </div>
        <div className="card stock-alerts">
          <h3>Stock Alerts</h3>
          <div className="placeholder-content">
            <p>Low stock warnings will appear here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
