import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <Button onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
