import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Toggles for eyes
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const[showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState('');
  const[isError, setIsError] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("New passwords don't match.");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`${API_URL}/api/auth/change-password`, {
        currentPassword, newPassword
      }, config);
      
      setIsError(false);
      setMessage('Password updated successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-8 border-b border-border pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Account Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and security</p>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="bg-secondary text-secondary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-80 transition-colors">
              Back to Dashboard
            </Link>
            <button onClick={logout} className="bg-red-600/10 text-red-500 border border-red-600/20 px-4 py-2 rounded text-sm font-medium hover:bg-red-600/20 transition-colors">
              Logout
            </button>
          </div>
        </header>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm max-w-md mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4 text-primary">Change Password</h2>
          
          {message && (
            <div className={`p-3 mb-4 rounded text-sm text-center font-medium ${isError ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Email (Locked)</label>
              <input type="email" disabled value={user?.email || ''} className="w-full bg-secondary/50 text-muted-foreground border border-border px-3 py-2 text-sm rounded cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Current Password</label>
              <div className="relative">
                <input required type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">New Password</label>
              <div className="relative">
                <input required type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input required type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-colors mt-4">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;