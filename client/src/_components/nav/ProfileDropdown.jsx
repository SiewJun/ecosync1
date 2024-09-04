import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProfileDropdown = ({ user }) => {
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      // Use navigate to programmatically redirect after logout
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const renderMenuItems = () => {
    switch (user.role) {
      case 'CONSUMER':
        return (
          <>
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/quotation">Quotation</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/order">Order</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/invoice">Invoice</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </>
        );
      case 'COMPANY':
        return (
          <>
            <DropdownMenuItem asChild>
              <Link to="/company-details">Company Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/company-profile">Company Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/quotation">Quotation</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/projects">Projects</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </>
        );
      case 'ADMIN':
        return (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admindashboard">Dashboard</Link>
            </DropdownMenuItem>
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
        <div>
          <Avatar>
            <AvatarImage src={user.avatarUrl || 'https://via.placeholder.com/150'} alt="User Avatar" />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Hi {user.username[0]}</DropdownMenuLabel>
        {renderMenuItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;