import { useData } from '../../context/DataContext';
import { History } from 'lucide-react';
import '../../styles/Operations.css';

export default function Ledger() {
  const { products, transactions } = useData();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Stock Ledger (Move History)</h1>
          <p>Complete audit trail of all inventory movements.</p>
        </div>
        <div className="btn-secondary" style={{cursor: 'default'}}>
          <History size={20} />
          <span>{transactions.length} Records</span>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Product</th>
              <th className="text-right">Quantity</th>
              <th>Details</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => {
              const product = products.find(p => p.id === tx.productId);
              
              let typeClass = 'badge';
              let qtyPrefix = '';
              let qtyColor = '';
              
              if (tx.type === 'RECEIPT') { typeClass += ' text-success'; qtyPrefix = '+'; qtyColor = 'text-success'; }
              else if (tx.type === 'DELIVERY') { typeClass += ' text-warning'; qtyPrefix = '-'; qtyColor = 'text-warning'; }
              else if (tx.type === 'TRANSFER') { typeClass += ' text-primary'; qtyPrefix = ''; }
              else if (tx.type === 'ADJUSTMENT') { typeClass += ' text-danger'; qtyPrefix = tx.quantity > 0 ? '+' : ''; qtyColor = tx.quantity > 0 ? 'text-success' : 'text-danger'; }

              return (
                <tr key={tx.id}>
                  <td>{tx.date?.toDate ? tx.date.toDate().toLocaleString() : new Date(tx.date).toLocaleString()}</td>
                  <td><span className={typeClass}>{tx.type}</span></td>
                  <td className="font-medium">{product ? product.name : 'Unknown'}</td>
                  <td className={`text-right font-medium ${qtyColor}`}>
                    {qtyPrefix}{tx.quantity}
                  </td>
                  <td className="text-muted" style={{maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {tx.notes || '-'}
                  </td>
                  <td>{tx.userEmail}</td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-muted">No transaction history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
