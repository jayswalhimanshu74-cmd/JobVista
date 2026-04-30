import axiosInstance from "../../api/axiosConfig";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/navbar.css";
import { isAuthenticated } from "../../utills/auth";
import { Bell } from "lucide-react";
import webSocketService from "../../api/webSocketService";
import notificationService from "../../api/notificationService";
import NotificationDropdown from "../ui/NotificationDropdown";

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load from localStorage first (instant render, no flicker)
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Fetch from API only if not in localStorage
  useEffect(() => {
    if (!user && loggedIn) {
      axiosInstance.get("/users/me")
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch(() => {
          setUser(null);
        });
    }
  }, [loggedIn, user]);

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

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.log("Logout API failed, continuing...");
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    webSocketService.disconnect();
    navigate("/login");
  };

  const isCompany = user?.role === "COMPANY";

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="logo">JobVista</h2>
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
              <Link to="/company-dashboard" className="btn profile-btn">
                🏢 {user?.name || "Dashboard"}
              </Link>
            ) : (
              <Link to="/profile" className="btn profile-btn">
                {user?.fullName || user?.name || "Profile"}
              </Link>
            )}
            <button onClick={handleLogout} className="btn logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn login-btn">Login</Link>
            <Link to="/signup" className="btn signup-btn">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;