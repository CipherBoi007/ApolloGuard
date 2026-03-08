import { useAuth } from '../../contexts/AuthContext';
import { BellIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-end px-6">
      <div className="flex items-center space-x-4">
        <button className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-100">
          <BellIcon className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-secondary-200"></div>
        <div className="text-sm text-secondary-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;