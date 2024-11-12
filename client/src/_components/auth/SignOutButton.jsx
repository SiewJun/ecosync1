import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

const SignOutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      navigate('/signin');
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <Button onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default SignOutButton;