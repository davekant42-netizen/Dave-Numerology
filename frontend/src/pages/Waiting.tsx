import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Waiting = () => {
  const { logout, user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Account Pending</h2>
        
        {user?.status === 'blacklisted' ? (
          <p className="text-red-500 mb-6">
            Your account is blacklisted. Please contact support for access.
          </p>
        ) : user?.status === 'pending' ? (
          <div className="mb-6">
            <p className="text-muted-foreground mb-2">
              You are currently on the waiting list.
            </p>
            <p className="text-muted-foreground">
              An admin needs to whitelist your account before you can access the DAVE Numerology Dashboard.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground mb-6">
            Please contact support for access.
          </p>
        )}

        <div className="bg-secondary/50 p-4 rounded text-sm text-foreground mb-8">
          <p>Contact Support:</p>
          <p className="font-semibold text-white mt-1">davekant42@gmail.com</p>
          <p className="font-semibold text-white">+91 7534086728,+91 8839855243</p>
        </div>

        <button
          onClick={logout}
          className="bg-white text-black font-semibold py-2 px-6 rounded hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Waiting;