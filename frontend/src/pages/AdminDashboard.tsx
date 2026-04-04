import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // <-- Imported Icons

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const[filter, setFilter] = useState('all'); 
  const [tab, setTab] = useState('users');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const[showAdminPassword, setShowAdminPassword] = useState(false); // Eye toggle
  const [adminMessage, setAdminMessage] = useState('');

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const[showUserPassword, setShowUserPassword] = useState(false); // Eye toggle
  const [userMessage, setUserMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get(`${API_URL}/api/admin/users`, config);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (user?.token) fetchUsers();
  }, [user]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`${API_URL}/api/admin/users/${id}/status`, { status: newStatus }, config);
      fetchUsers(); 
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  // NEW: Handle Permanent Delete
  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to completely delete this user? This action cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.delete(`${API_URL}/api/admin/users/${id}`, config);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(`${API_URL}/api/admin/add-admin`, { name: adminName, email: adminEmail, password: adminPassword }, config);
      setAdminMessage('Admin added successfully!');
      setAdminName(''); setAdminEmail(''); setAdminPassword('');
      fetchUsers(); 
    } catch (error: any) {
      setAdminMessage(error.response?.data?.message || 'Error adding admin');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post(`${API_URL}/api/admin/add-user`, { name: userName, email: userEmail, password: userPassword }, config);
      setUserMessage('User added and instantly whitelisted!');
      setUserName(''); setUserEmail(''); setUserPassword('');
      fetchUsers(); 
    } catch (error: any) {
      setUserMessage(error.response?.data?.message || 'Error adding user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-8 border-b border-border pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage users and permissions</p>
          </div>
          <div className="flex gap-4">
            <Link to="/settings" className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-80 transition-colors">
              Settings
            </Link>
            <Link to="/" className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-80 transition-colors">
              Back to Dashboard
            </Link>
            <button onClick={logout} className="bg-red-600/10 text-red-500 border border-red-600/20 px-4 py-2 rounded text-sm font-medium hover:bg-red-600/20 transition-colors">
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-6 border-b border-border pb-4">
          <button onClick={() => setTab('users')} className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${tab === 'users' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>Manage Users</button>
          <button onClick={() => setTab('add-admin')} className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${tab === 'add-admin' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>Add New Admin</button>
          <button onClick={() => setTab('add-user')} className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${tab === 'add-user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>Add New User</button>
        </div>

        {tab === 'users' && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm overflow-hidden">
            <div className="flex flex-wrap gap-4 mb-6">
              <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm rounded flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="whitelisted">Whitelisted</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium">{u.name}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="py-4 px-4">
                        {u.isAdmin ? <span className="bg-primary/20 text-primary px-2.5 py-1 rounded text-xs font-semibold">Admin</span> : <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded text-xs font-semibold">User</span>}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${u.status === 'whitelisted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : u.status === 'blacklisted' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!u.isAdmin && (
                          <div className="flex justify-end gap-2">
                            {u.status !== 'whitelisted' && <button onClick={() => handleStatusChange(u._id, 'whitelisted')} className="bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 border border-emerald-600/20 px-3 py-1.5 rounded text-xs font-medium transition-colors">Whitelist</button>}
                            {u.status !== 'blacklisted' && <button onClick={() => handleStatusChange(u._id, 'blacklisted')} className="bg-orange-600/10 text-orange-500 hover:bg-orange-600/20 border border-orange-600/20 px-3 py-1.5 rounded text-xs font-medium transition-colors">Blacklist</button>}
                            {/* NEW: DELETE BUTTON */}
                            <button onClick={() => handleDeleteUser(u._id)} className="bg-red-600 text-white hover:bg-red-700 border border-red-700 px-3 py-1.5 rounded text-xs font-medium transition-colors ml-2">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'add-admin' && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm max-w-md mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">Create Admin User</h2>
            {adminMessage && <div className={`p-3 mb-4 rounded text-sm text-center font-medium ${adminMessage.includes('successfully') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{adminMessage}</div>}
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div><label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Name</label><input required type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div><label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Email Address</label><input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input required type={showAdminPassword ? 'text' : 'password'} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
                  <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-3 top-2 text-muted-foreground hover:text-foreground">{showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-colors mt-2">Add Admin</button>
            </form>
          </div>
        )}

        {tab === 'add-user' && (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm max-w-md mx-auto mt-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">Create Normal User</h2>
            {userMessage && <div className={`p-3 mb-4 rounded text-sm text-center font-medium ${userMessage.includes('whitelisted') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{userMessage}</div>}
            <form onSubmit={handleAddUser} className="space-y-4">
              <div><label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Name</label><input required type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div><label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Email Address</label><input required type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary" /></div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input required type={showUserPassword ? 'text' : 'password'} value={userPassword} onChange={(e) => setUserPassword(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
                  <button type="button" onClick={() => setShowUserPassword(!showUserPassword)} className="absolute right-3 top-2 text-muted-foreground hover:text-foreground">{showUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-colors mt-2">Add Normal User</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;