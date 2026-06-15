import axiosInstance from "../../api/axiosConfig";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/navbar.css";
import { isAuthenticated } from "../../utills/auth";
import { Bell, Menu, X } from "lucide-react";
import webSocketService from "../../api/webSocketService";
import notificationService from "../../api/notificationService";
import NotificationDropdown from "../ui/NotificationDropdown";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { loggedIn, user: contextUser, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync context user with local state
  const user = contextUser;

  // 🔥 WebSocket and Notifications Logic
  useEffect(() => {
    if (loggedIn && user) {
      // 1. Initial fetch
      notificationService.getNotifications().then(setNotifications);
      notificationService.getUnreadCount().then(setUnreadCount);

      // 2. Connect WebSocket
      webSocketService.connect(() => {
        // Subscribe to notifications
        webSocketService.subscribe(`/topic/notifications/${user.email}`, (message) => {
          // message is just a string in our current implementation
          // Re-fetch to get the full object with ID and Type
          notificationService.getNotifications().then(setNotifications);
          notificationService.getUnreadCount().then(setUnreadCount);
          
          // Show toast or browser notification if needed
        });
      });

      return () => {
        webSocketService.disconnect();
      };
    }
  }, [loggedIn, user]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const isCompany = user?.role === "COMPANY";

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>JobVista</h2>
        </div>

        <ul className="nav-center">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/jobs">Jobs</Link></li>
          <li><Link to="/companies">Companies</Link></li>
          {isCompany ? (
            <li><Link to="/company-dashboard">Dashboard</Link></li>
          ) : (
            <li><Link to="/resume">Resume</Link></li>
          )}
          <li><Link to="/about">About</Link></li>
        </ul>

        {/* Desktop Navigation Actions */}
        <div className="nav-right">
          {isAuthenticated() ? (
            <>
              <div className="notification-bell-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell size={22} color="#4b5563" />
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </div>
              
              {showNotifications && (
                  <NotificationDropdown 
                      notifications={notifications} 
                      onMarkAsRead={handleMarkAsRead}
                      onClose={() => setShowNotifications(false)}
                  />
              )}

              {isCompany ? (
                <Link to="/company-dashboard" className="btn btn-secondary">
                  🏢 {user?.name || "Dashboard"}
                </Link>
              ) : (
                <Link to="/profile" className="btn btn-secondary">
                  {user?.fullName || user?.name || "Profile"}
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline hover:text-black transition-all duration-300 ease-in-out cursor-pointer hover:bg-white">Login</Link>
              <Link to="/signup" className="btn btn-primary hover:text-white transition-all duration-300 ease-in-out cursor-pointer hover:bg-primary">Signup</Link>
            </>
          )}
        </div>

        {/* Mobile Navigation Controls */}
        <div className="nav-right-mobile" style={{ display: "none" }}>
          {isAuthenticated() && (
            <div className="notification-bell-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={22} color="#4b5563" />
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </div>
          )}
          
          {showNotifications && (
              <NotificationDropdown 
                  notifications={notifications} 
                  onMarkAsRead={handleMarkAsRead}
                  onClose={() => setShowNotifications(false)}
              />
          )}

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}>
        <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-drawer-header">
            <h2 className="logo">JobVista</h2>
            <button className="menu-close-btn" onClick={() => setMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <ul className="mobile-menu-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/jobs" onClick={() => setMenuOpen(false)}>Jobs</Link></li>
            <li><Link to="/companies" onClick={() => setMenuOpen(false)}>Companies</Link></li>
            {isCompany ? (
              <li><Link to="/company-dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
            ) : (
              <li><Link to="/resume" onClick={() => setMenuOpen(false)}>Resume</Link></li>
            )}
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          </ul>

          <div className="mobile-menu-actions">
            {isAuthenticated() ? (
              <>
                {isCompany ? (
                  <Link to="/company-dashboard" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>
                    🏢 {user?.name || "Dashboard"}
                  </Link>
                ) : (
                  <Link to="/profile" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>
                    👤 {user?.fullName || user?.name || "Profile"}
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-danger">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Signup</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;