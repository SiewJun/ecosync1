import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';

const ProfileDropdown = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
      localStorage.removeItem('token');
      navigate('/signin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const renderMenuItems = () => {
    switch (user.role) {
      case 'CONSUMER':
        return (
          <>
            <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/quotation')}>Quotation</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/order')}>Order</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/invoice')}>Invoice</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </>
        );
      case 'COMPANY':
        return (
          <>
            <DropdownMenuItem onClick={() => navigate('/company-details')}>Company Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/company-profile')}>Company Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/quotation')}>Quotation</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/projects')}>Projects</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </>
        );
      case 'ADMIN':
        return (
          <>
            <DropdownMenuItem onClick={() => navigate('/admindashboard')}>Dashboard</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Avatar>
            <AvatarImage src={user.avatarUrl || 'https://via.placeholder.com/150'} alt="User Avatar" />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Hi {user.username[0]}</DropdownMenuLabel>
        {renderMenuItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
