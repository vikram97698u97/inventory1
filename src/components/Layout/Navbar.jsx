import { Bell, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
      </div>
      <div className="navbar-right">
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <div className="user-profile">
          <UserCircle size={24} />
          <span>{user?.email?.split('@')[0] || 'Admin'}</span>
        </div>
        <button onClick={logout} className="icon-btn" title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
