import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useData } from '../../context/DataContext';

export default function Layout() {
  const { dbError } = useData();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {dbError && (
          <div style={{ padding: '16px', backgroundColor: 'var(--danger)', color: 'white', margin: '24px 24px 0 24px', borderRadius: '8px' }}>
            <strong>Database Connection Error:</strong> {dbError}
            <br />
            Make sure you have enabled Firestore Database in your Firebase Console and set the Security Rules to allow read/write access.
          </div>
        )}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
