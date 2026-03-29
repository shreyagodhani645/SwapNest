import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [categoryReport, setCategoryReport] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [dbObjects, setDbObjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getStats();
      setStats(res.data);
    } catch (err) { console.error('Stats error:', err); }
  }, []);

  const fetchUsers = useCallback(async (search = '') => {
    try {
      const res = await adminApi.getUsers(search);
      setUsers(res.data);
    } catch (err) { console.error('Users error:', err); }
  }, []);

  const fetchListings = useCallback(async () => {
    try {
      const res = await adminApi.getListings({ search: listingSearch });
      setListings(res.data);
    } catch (err) { console.error('Listings error:', err); }
  }, [listingSearch]);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await adminApi.getOffers();
      setOffers(res.data);
    } catch (err) { console.error('Offers error:', err); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data);
    } catch (err) { console.error('Categories error:', err); }
  }, []);

  const fetchAuditLog = useCallback(async () => {
    try {
      const res = await adminApi.getAuditLog();
      setAuditLog(res.data);
    } catch (err) { console.error('Audit error:', err); }
  }, []);

  const fetchActivityLog = useCallback(async () => {
    try {
      const res = await adminApi.getActivityLog();
      setActivityLog(res.data);
    } catch (err) { console.error('Activity error:', err); }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const [catRes, sellRes, actRes, dbRes] = await Promise.all([
        adminApi.getCategoryReport(),
        adminApi.getTopSellers(),
        adminApi.getRecentActivity(),
        adminApi.getDBObjects()
      ]);
      setCategoryReport(catRes.data);
      setTopSellers(sellRes.data);
      setRecentActivity(actRes.data);
      setDbObjects(dbRes.data);
    } catch (err) { console.error('Reports error:', err); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchListings()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'offers') fetchOffers();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'audit') { fetchAuditLog(); fetchActivityLog(); }
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  // ===== User Actions =====
  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}" and all their data?`)) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      fetchUsers(userSearch); fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggleBan = async (id, username, isBanned) => {
    const action = isBanned ? 'unban' : 'ban';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} user "${username}"?`)) return;
    try {
      await adminApi.toggleBan(id);
      toast.success(`User ${action}ned`);
      fetchUsers(userSearch); fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleChangeRole = async (id, username, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${username}'s role to ${newRole}?`)) return;
    try {
      await adminApi.changeRole(id, newRole);
      toast.success(`Role changed to ${newRole}`);
      fetchUsers(userSearch); fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ===== Listing Actions =====
  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Delete listing "${title}"?`)) return;
    try {
      await adminApi.deleteListing(id);
      toast.success('Listing deleted');
      fetchListings(); fetchStats();
    } catch (err) { toast.error('Failed'); }
  };

  const handleChangeListingStatus = async (id, status) => {
    try {
      await adminApi.changeListingStatus(id, status);
      toast.success(`Status changed to ${status}`);
      fetchListings(); fetchStats();
    } catch (err) { toast.error('Failed'); }
  };

  // ===== Offer Actions =====
  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await adminApi.deleteOffer(id);
      toast.success('Offer deleted');
      fetchOffers(); fetchStats();
    } catch (err) { toast.error('Failed'); }
  };

  // ===== Category Actions =====
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await adminApi.createCategory(newCategoryName.trim());
      toast.success('Category created');
      setNewCategoryName('');
      fetchCategories(); fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCategory?.name?.trim()) return;
    try {
      await adminApi.updateCategory(id, editingCategory.name.trim());
      toast.success('Category updated');
      setEditingCategory(null);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories(); fetchStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  // ===== Styles =====
  const s = {
    page: { minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    nav: { background: 'rgba(15,15,25,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 },
    navInner: { maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 },
    logo: { display: 'flex', alignItems: 'center', gap: 12 },
    logoIcon: { width: 40, height: 40, background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
    logoText: { fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' },
    logoAccent: { color: '#ef4444' },
    navRight: { display: 'flex', alignItems: 'center', gap: 16 },
    navUser: { fontSize: 13, color: '#94a3b8' },
    navUserBold: { color: '#fff', fontWeight: 700 },
    logoutBtn: { padding: '8px 16px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' },
    container: { maxWidth: 1400, margin: '0 auto', padding: '32px 24px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
    statCard: (gradient) => ({ background: `linear-gradient(135deg, ${gradient})`, borderRadius: 16, padding: '20px 24px', position: 'relative', overflow: 'hidden' }),
    statValue: { fontSize: 32, fontWeight: 900, lineHeight: 1, marginBottom: 4 },
    statLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 },
    tabs: { display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' },
    tab: (active) => ({ padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: active ? '#ef4444' : 'rgba(255,255,255,0.04)', color: active ? '#fff' : '#94a3b8', boxShadow: active ? '0 4px 20px rgba(239,68,68,0.3)' : 'none' }),
    panel: { background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' },
    panelHeader: { padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    panelTitle: { fontSize: 20, fontWeight: 900 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' },
    td: { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 },
    searchInput: { padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', width: 260 },
    badge: (color) => ({ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', background: `rgba(${color},0.15)`, color: `rgb(${color})`, display: 'inline-block' }),
    btnDanger: { padding: '6px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s' },
    btnWarn: { padding: '6px 14px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s' },
    btnSuccess: { padding: '6px 14px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12, transition: 'all 0.2s' },
    btnPrimary: { padding: '8px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 },
    btnSmall: { padding: '6px 14px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 12 },
    input: { padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' },
    select: { padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none' },
    row: { transition: 'background 0.15s' },
    emptyState: { textAlign: 'center', padding: 60, color: '#64748b' },
    reportCard: { background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: 24, marginBottom: 20 },
    reportTitle: { fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    spinner: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f' }
  };

  const statCards = [
    { label: 'Total Users', value: stats.users || 0, icon: '👥', gradient: '#3b82f6, #1d4ed8' },
    { label: 'Active Listings', value: stats.activeListings || stats.listings || 0, icon: '📦', gradient: '#22c55e, #16a34a' },
    { label: 'Total Offers', value: stats.offers || 0, icon: '💰', gradient: '#a855f7, #7c3aed' },
    { label: 'Messages', value: stats.messages || 0, icon: '💬', gradient: '#f97316, #ea580c' },
    { label: 'Categories', value: stats.categories || 0, icon: '🏷️', gradient: '#06b6d4, #0891b2' },
    { label: 'Sold Items', value: stats.soldListings || 0, icon: '✅', gradient: '#10b981, #059669' },
    { label: 'Revenue Potential', value: `₹${(stats.totalActiveValue || 0).toLocaleString()}`, icon: '📊', gradient: '#ec4899, #db2777' },
    { label: 'Avg Price', value: `₹${(stats.avgListingPrice || 0).toLocaleString()}`, icon: '📈', gradient: '#8b5cf6, #6d28d9' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'listings', label: 'Listings', icon: '📦' },
    { id: 'offers', label: 'Offers', icon: '💰' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'audit', label: 'Audit Log', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  if (loading) return (
    <div style={s.spinner}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading Admin Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Navigation */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}>🛡️</div>
            <span style={s.logoText}>SwapNest <span style={s.logoAccent}>Admin</span></span>
          </div>
          <div style={s.navRight}>
            <span style={s.navUser}>Signed in as <span style={s.navUserBold}>{user?.username}</span></span>
            <button style={s.logoutBtn} onClick={handleLogout} onMouseEnter={e => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }} onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.15)'; e.target.style.color = '#f87171'; }}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={s.container}>
        {/* Stats Cards */}
        <div style={s.statsGrid}>
          {statCards.map((card, idx) => (
            <div key={idx} style={s.statCard(card.gradient)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{card.icon}</span>
              </div>
              <div style={s.statValue}>{card.value}</div>
              <div style={s.statLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={s.tabs}>
          {tabs.map(tab => (
            <button key={tab.id} style={s.tab(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>Platform Overview</h2>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Total Users', val: stats.users, color: '#3b82f6' },
                  { label: 'Admin Users', val: stats.admins || 0, color: '#ef4444' },
                  { label: 'Banned Users', val: stats.bannedUsers || 0, color: '#f97316' },
                  { label: 'Total Listings', val: stats.listings, color: '#22c55e' },
                  { label: 'Active Listings', val: stats.activeListings || 0, color: '#10b981' },
                  { label: 'Sold Listings', val: stats.soldListings || 0, color: '#06b6d4' },
                  { label: 'Reserved', val: stats.reservedListings || 0, color: '#8b5cf6' },
                  { label: 'Total Offers', val: stats.offers, color: '#a855f7' },
                  { label: 'Pending Offers', val: stats.pendingOffers || 0, color: '#fbbf24' },
                  { label: 'Accepted Offers', val: stats.acceptedOffers || 0, color: '#34d399' },
                  { label: 'Messages', val: stats.messages, color: '#f97316' },
                  { label: 'Wishlisted', val: stats.wishlisted || 0, color: '#ec4899' },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '20px 16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: item.color, lineHeight: 1 }}>{item.val || 0}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginTop: 6 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== USERS TAB ==================== */}
        {activeTab === 'users' && (
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>All Users ({users.length})</h2>
              <input
                type="text" placeholder="Search users..." value={userSearch}
                onChange={e => { setUserSearch(e.target.value); fetchUsers(e.target.value); }}
                style={s.searchInput}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Username', 'Email', 'Role', 'Status', 'Listings', 'Trust', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.ID} style={s.row} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...s.td, fontFamily: 'monospace', color: '#64748b' }}>{u.ID}</td>
                      <td style={{ ...s.td, fontWeight: 700 }}>{u.USERNAME}</td>
                      <td style={{ ...s.td, color: '#94a3b8' }}>{u.EMAIL}</td>
                      <td style={s.td}>
                        <span style={s.badge(u.ROLE === 'admin' ? '239,68,68' : '59,130,246')}>
                          {u.ROLE || 'user'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={s.badge(u.IS_BANNED ? '249,115,22' : '34,197,94')}>
                          {u.IS_BANNED ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontWeight: 700, color: '#94a3b8' }}>{u.LISTING_COUNT || 0}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 40, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${u.TRUST_SCORE || 0}%`, height: '100%', background: (u.TRUST_SCORE || 0) > 60 ? '#22c55e' : (u.TRUST_SCORE || 0) > 30 ? '#fbbf24' : '#ef4444', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{u.TRUST_SCORE || 0}</span>
                        </div>
                      </td>
                      <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{formatDate(u.CREATED_AT)}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {u.ROLE !== 'admin' && (
                            <>
                              <button style={s.btnWarn} onClick={() => handleToggleBan(u.ID, u.USERNAME, u.IS_BANNED)}>
                                {u.IS_BANNED ? '🔓 Unban' : '🚫 Ban'}
                              </button>
                              <button style={s.btnSmall} onClick={() => handleChangeRole(u.ID, u.USERNAME, u.ROLE)}>
                                ⬆️ Promote
                              </button>
                              <button style={s.btnDanger} onClick={() => handleDeleteUser(u.ID, u.USERNAME)}>
                                🗑️ Delete
                              </button>
                            </>
                          )}
                          {u.ROLE === 'admin' && u.ID !== user?.id && (
                            <button style={s.btnWarn} onClick={() => handleChangeRole(u.ID, u.USERNAME, u.ROLE)}>
                              ⬇️ Demote
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={s.emptyState}>No users found.</div>}
            </div>
          </div>
        )}

        {/* ==================== LISTINGS TAB ==================== */}
        {activeTab === 'listings' && (
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>All Listings ({listings.length})</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text" placeholder="Search listings..." value={listingSearch}
                  onChange={e => setListingSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchListings()}
                  style={s.searchInput}
                />
                <button style={s.btnPrimary} onClick={fetchListings}>Search</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Title', 'Price', 'Seller', 'Category', 'Status', 'Location', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l.ID} style={s.row} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...s.td, fontFamily: 'monospace', color: '#64748b' }}>{l.ID}</td>
                      <td style={{ ...s.td, fontWeight: 700, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.TITLE}</td>
                      <td style={{ ...s.td, color: '#22c55e', fontWeight: 700 }}>₹{l.PRICE?.toLocaleString()}</td>
                      <td style={{ ...s.td, color: '#94a3b8' }}>{l.SELLER_NAME}</td>
                      <td style={s.td}><span style={s.badge('99,102,241')}>{l.CATEGORY_NAME}</span></td>
                      <td style={s.td}>
                        <select value={l.STATUS || 'active'} onChange={e => handleChangeListingStatus(l.ID, e.target.value)} style={s.select}>
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="reserved">Reserved</option>
                          <option value="removed">Removed</option>
                        </select>
                      </td>
                      <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{l.LOCATION || 'N/A'}</td>
                      <td style={s.td}>
                        <button style={s.btnDanger} onClick={() => handleDeleteListing(l.ID, l.TITLE)}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {listings.length === 0 && <div style={s.emptyState}>No listings found.</div>}
            </div>
          </div>
        )}

        {/* ==================== OFFERS TAB ==================== */}
        {activeTab === 'offers' && (
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>All Offers ({offers.length})</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Listing', 'Buyer', 'Seller', 'Offer Price', 'Listing Price', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offers.map(o => (
                    <tr key={o.ID} style={s.row} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...s.td, fontFamily: 'monospace', color: '#64748b' }}>{o.ID}</td>
                      <td style={{ ...s.td, fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.LISTING_TITLE}</td>
                      <td style={{ ...s.td, color: '#3b82f6' }}>{o.BUYER_NAME}</td>
                      <td style={{ ...s.td, color: '#22c55e' }}>{o.SELLER_NAME}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: '#fbbf24' }}>₹{o.OFFER_PRICE?.toLocaleString()}</td>
                      <td style={{ ...s.td, color: '#94a3b8' }}>₹{o.LISTING_PRICE?.toLocaleString()}</td>
                      <td style={s.td}>
                        <span style={s.badge(
                          o.STATUS === 'accepted' || o.STATUS === 'ACCEPTED' ? '34,197,94' :
                          o.STATUS === 'rejected' || o.STATUS === 'REJECTED' ? '239,68,68' : '251,191,36'
                        )}>
                          {o.STATUS}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{formatDate(o.CREATED_AT)}</td>
                      <td style={s.td}>
                        <button style={s.btnDanger} onClick={() => handleDeleteOffer(o.ID)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {offers.length === 0 && <div style={s.emptyState}>No offers found.</div>}
            </div>
          </div>
        )}

        {/* ==================== CATEGORIES TAB ==================== */}
        {activeTab === 'categories' && (
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>Category Management ({categories.length})</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" placeholder="New category name..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateCategory()} style={s.input} />
                <button style={s.btnPrimary} onClick={handleCreateCategory}>+ Add</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['ID', 'Name', 'Active Listings', 'Total Value', 'Avg Price', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.ID} style={s.row} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ ...s.td, fontFamily: 'monospace', color: '#64748b' }}>{c.ID}</td>
                      <td style={s.td}>
                        {editingCategory?.id === c.ID ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} style={{ ...s.input, padding: '6px 10px', fontSize: 13 }} />
                            <button style={s.btnSuccess} onClick={() => handleUpdateCategory(c.ID)}>✓</button>
                            <button style={s.btnDanger} onClick={() => setEditingCategory(null)}>✗</button>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 700 }}>{c.NAME}</span>
                        )}
                      </td>
                      <td style={{ ...s.td, fontWeight: 700, color: '#3b82f6' }}>{c.LISTING_COUNT}</td>
                      <td style={{ ...s.td, color: '#22c55e', fontWeight: 600 }}>₹{c.TOTAL_VALUE?.toLocaleString()}</td>
                      <td style={{ ...s.td, color: '#94a3b8' }}>₹{c.AVG_PRICE?.toLocaleString()}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={s.btnSmall} onClick={() => setEditingCategory({ id: c.ID, name: c.NAME })}>✏️ Edit</button>
                          <button style={s.btnDanger} onClick={() => handleDeleteCategory(c.ID, c.NAME)}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && <div style={s.emptyState}>No categories found.</div>}
            </div>
          </div>
        )}

        {/* ==================== AUDIT LOG TAB ==================== */}
        {activeTab === 'audit' && (
          <div>
            {/* Listing Audit Log */}
            <div style={{ ...s.panel, marginBottom: 20 }}>
              <div style={s.panelHeader}>
                <h2 style={s.panelTitle}>📋 Listing Status Audit Log</h2>
                <span style={{ fontSize: 12, color: '#64748b' }}>Tracked by TRG_LISTING_STATUS_LOG trigger</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['ID', 'Listing', 'Old Status', 'New Status', 'Remarks', 'Changed At'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map(a => (
                      <tr key={a.ID} style={s.row}>
                        <td style={{ ...s.td, fontFamily: 'monospace', color: '#64748b' }}>{a.ID}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{a.LISTING_TITLE || `#${a.LISTING_ID}`}</td>
                        <td style={s.td}><span style={s.badge('239,68,68')}>{a.OLD_STATUS || 'NULL'}</span></td>
                        <td style={s.td}><span style={s.badge('34,197,94')}>{a.NEW_STATUS}</span></td>
                        <td style={{ ...s.td, color: '#94a3b8', fontSize: 13 }}>{a.REMARKS}</td>
                        <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{formatDateTime(a.CHANGED_AT)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {auditLog.length === 0 && <div style={s.emptyState}>No audit entries yet. Status changes will be recorded here by the database trigger.</div>}
              </div>
            </div>

            {/* Admin Activity Log */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <h2 style={s.panelTitle}>🔐 Admin Activity Log</h2>
                <span style={{ fontSize: 12, color: '#64748b' }}>Tracked by stored procedures</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['ID', 'Admin', 'Action', 'Target', 'Description', 'Time'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map(a => (
                      <tr key={a.ID} style={s.row}>
                        <td style={{ ...s.td, fontFamily: 'monospace', color: '#64748b' }}>{a.ID}</td>
                        <td style={{ ...s.td, fontWeight: 600, color: '#ef4444' }}>{a.ADMIN_NAME || `#${a.ADMIN_ID}`}</td>
                        <td style={s.td}><span style={s.badge('168,85,247')}>{a.ACTION_TYPE}</span></td>
                        <td style={{ ...s.td, color: '#94a3b8' }}>{a.TARGET_TABLE} #{a.TARGET_ID}</td>
                        <td style={{ ...s.td, fontSize: 13 }}>{a.DESCRIPTION}</td>
                        <td style={{ ...s.td, color: '#64748b', fontSize: 13 }}>{formatDateTime(a.ACTION_AT)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {activityLog.length === 0 && <div style={s.emptyState}>No admin actions recorded yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ==================== REPORTS TAB ==================== */}
        {activeTab === 'reports' && (
          <div>
            {/* Category Report */}
            <div style={s.reportCard}>
              <div style={s.reportTitle}>📊 Category-wise Analytics</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Category', 'Total', 'Active', 'Sold', 'Total Value', 'Avg Price', 'Min', 'Max'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryReport.map((c, i) => (
                      <tr key={i} style={s.row}>
                        <td style={{ ...s.td, fontWeight: 700 }}>{c.CATEGORY_NAME}</td>
                        <td style={{ ...s.td, fontWeight: 700, color: '#3b82f6' }}>{c.TOTAL_LISTINGS}</td>
                        <td style={{ ...s.td, color: '#22c55e' }}>{c.ACTIVE_COUNT}</td>
                        <td style={{ ...s.td, color: '#06b6d4' }}>{c.SOLD_COUNT}</td>
                        <td style={{ ...s.td, fontWeight: 600, color: '#fbbf24' }}>₹{c.TOTAL_VALUE?.toLocaleString()}</td>
                        <td style={{ ...s.td, color: '#94a3b8' }}>₹{c.AVG_PRICE?.toLocaleString()}</td>
                        <td style={{ ...s.td, color: '#64748b' }}>₹{c.MIN_PRICE?.toLocaleString()}</td>
                        <td style={{ ...s.td, color: '#64748b' }}>₹{c.MAX_PRICE?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Sellers */}
            <div style={s.reportCard}>
              <div style={s.reportTitle}>🏆 Top 10 Sellers</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Rank', 'Seller', 'Email', 'Listings', 'Total Value', 'Sold'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topSellers.map((ts, i) => (
                      <tr key={i} style={s.row}>
                        <td style={{ ...s.td, fontWeight: 900, color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#64748b' }}>#{i + 1}</td>
                        <td style={{ ...s.td, fontWeight: 700 }}>{ts.USERNAME}</td>
                        <td style={{ ...s.td, color: '#94a3b8' }}>{ts.EMAIL}</td>
                        <td style={{ ...s.td, fontWeight: 700, color: '#3b82f6' }}>{ts.LISTING_COUNT}</td>
                        <td style={{ ...s.td, color: '#22c55e', fontWeight: 600 }}>₹{ts.TOTAL_VALUE?.toLocaleString()}</td>
                        <td style={{ ...s.td, color: '#06b6d4' }}>{ts.SOLD_COUNT}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div style={s.reportCard}>
              <div style={s.reportTitle}>🔄 Recent Platform Activity</div>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {recentActivity.map((a, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>
                      {a.TYPE === 'NEW_LISTING' ? '📦' : a.TYPE === 'NEW_OFFER' ? '💰' : '👤'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{a.USERNAME}</span>
                      <span style={{ color: '#64748b', marginLeft: 6 }}>
                        {a.TYPE === 'NEW_LISTING' ? 'posted' : a.TYPE === 'NEW_OFFER' ? 'offered on' : 'joined'}: 
                      </span>
                      <span style={{ color: '#94a3b8', marginLeft: 4 }}>{a.DESCRIPTION}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>{formatDateTime(a.CREATED_AT)}</span>
                  </div>
                ))}
                {recentActivity.length === 0 && <div style={s.emptyState}>No recent activity.</div>}
              </div>
            </div>

            {/* DB Objects Summary */}
            {dbObjects && (
              <div style={s.reportCard}>
                <div style={s.reportTitle}>🗄️ Database Objects Summary (DBMS Concepts)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {/* Tables */}
                  <div style={{ background: 'rgba(59,130,246,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(59,130,246,0.15)' }}>
                    <div style={{ fontWeight: 800, color: '#3b82f6', marginBottom: 10, fontSize: 14 }}>📋 Tables ({dbObjects.tables?.length || 0})</div>
                    {dbObjects.tables?.map((t, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', fontFamily: 'monospace' }}>{t.TABLE_NAME}</div>)}
                  </div>
                  {/* Views */}
                  <div style={{ background: 'rgba(168,85,247,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(168,85,247,0.15)' }}>
                    <div style={{ fontWeight: 800, color: '#a855f7', marginBottom: 10, fontSize: 14 }}>👁️ Views ({dbObjects.views?.length || 0})</div>
                    {dbObjects.views?.map((v, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', fontFamily: 'monospace' }}>{v.VIEW_NAME}</div>)}
                  </div>
                  {/* Procedures */}
                  <div style={{ background: 'rgba(34,197,94,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(34,197,94,0.15)' }}>
                    <div style={{ fontWeight: 800, color: '#22c55e', marginBottom: 10, fontSize: 14 }}>⚙️ Procedures ({dbObjects.procedures?.length || 0})</div>
                    {dbObjects.procedures?.map((p, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', fontFamily: 'monospace' }}>{p.OBJECT_NAME} <span style={{ color: p.STATUS === 'VALID' ? '#22c55e' : '#ef4444' }}>({p.STATUS})</span></div>)}
                  </div>
                  {/* Functions */}
                  <div style={{ background: 'rgba(6,182,212,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(6,182,212,0.15)' }}>
                    <div style={{ fontWeight: 800, color: '#06b6d4', marginBottom: 10, fontSize: 14 }}>🔧 Functions ({dbObjects.functions?.length || 0})</div>
                    {dbObjects.functions?.map((f, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', fontFamily: 'monospace' }}>{f.OBJECT_NAME} <span style={{ color: f.STATUS === 'VALID' ? '#22c55e' : '#ef4444' }}>({f.STATUS})</span></div>)}
                  </div>
                  {/* Triggers */}
                  <div style={{ background: 'rgba(249,115,22,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(249,115,22,0.15)' }}>
                    <div style={{ fontWeight: 800, color: '#f97316', marginBottom: 10, fontSize: 14 }}>⚡ Triggers ({dbObjects.triggers?.length || 0})</div>
                    {dbObjects.triggers?.map((t, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', fontFamily: 'monospace' }}>{t.TRIGGER_NAME} <span style={{ color: '#64748b' }}>on {t.TABLE_NAME}</span></div>)}
                  </div>
                  {/* Indexes */}
                  <div style={{ background: 'rgba(236,72,153,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(236,72,153,0.15)' }}>
                    <div style={{ fontWeight: 800, color: '#ec4899', marginBottom: 10, fontSize: 14 }}>📑 Indexes ({dbObjects.indexes?.length || 0})</div>
                    {dbObjects.indexes?.map((idx, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', fontFamily: 'monospace' }}>{idx.INDEX_NAME} <span style={{ color: '#64748b' }}>on {idx.TABLE_NAME}</span></div>)}
                  </div>
                  {/* Sequences */}
                  <div style={{ background: 'rgba(251,191,36,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(251,191,36,0.15)' }}>
                    <div style={{ fontWeight: 800, color: '#fbbf24', marginBottom: 10, fontSize: 14 }}>🔢 Sequences ({dbObjects.sequences?.length || 0})</div>
                    {dbObjects.sequences?.map((sq, i) => <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', fontFamily: 'monospace' }}>{sq.SEQUENCE_NAME}</div>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
