import { Link, useRouter } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import logo from '../assets/garden-black-text-logo.png';


interface NavbarProps {
  userName: string
  onLogout: () => void
  isLoggingOut: boolean
}

export const NavigationBar: React.FC<NavbarProps> = ({ userName, onLogout, isLoggingOut }) => {
  const router = useRouter()
  const currentPath = router.state.location.pathname

  return (
    <div className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-200 bg-white font-nunitoSans">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <img src={logo} alt="Logo" className="h-6 w-auto" />

        {/* Navigation Links */}
        <div className="flex items-center gap-4 text-sm font-semibold text-gray-700">
          <Link
            to="/dashboard"
            className={`pb-1 ${
              currentPath === '/dashboard'
                ? 'border-b-2 border-primary-100 text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/uploads"
            className={`pb-1 ${
              currentPath === '/uploads'
                ? 'border-b-2 border-primary-100 text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Past Uploads
          </Link>
        </div>
      </div>

      {/* Right: Name + Logout */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-gray-700">{userName}</div>
        <motion.button
          className="text-sm text-white px-4 py-2 rounded-md font-semibold bg-primary-100 hover:cursor-pointer"
          initial={{ backgroundColor: 'var(--color-primary-100)' }}
          animate={{ backgroundColor: 'var(--color-primary-100)' }}
          whileHover={{ backgroundColor: 'var(--color-primary-120)' }}
          transition={{ duration: 0.1 }}
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          Log out
        </motion.button>
      </div>
    </div>
  );
};
