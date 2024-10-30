import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-background/10 to-background/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Large 404 Display */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-foreground/10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-medium text-foreground">Page Not Found</span>
          </div>
        </div>
        
        {/* Message */}
        <div className="space-y-4">
          <p className="text-lg text-foreground/50">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-foreground/80 text-background rounded-lg hover:bg-foreground transition-colors duration-200 group"
            >
              <HomeIcon size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span>Return Home</span>
            </Link>
            
            <button 
              onClick={handleGoBack}
              className="flex items-center gap-2 px-6 py-3 border border-foreground/80 rounded-lg hover:bg-foreground transition-colors duration-200 text-foreground hover:text-background"
            >
              <ArrowLeft size={20} className="group-hover:translate-x-[-4px] transition-transform duration-200" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;