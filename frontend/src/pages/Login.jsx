/**
 * Login Page (Tasks 151-160)
 * Desktop-optimized guest authentication with feature showcase
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Zap, 
  Clock, 
  BarChart3, 
  Search, 
  Shield, 
  TrendingUp,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsGuest, loading, error: authError, isAuthenticated } = useAuth();
  
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Task 155: Implement guest login
  const handleGuestLogin = async () => {
    setError(null);
    setIsLoggingIn(true);

    try {
      const result = await loginAsGuest();
      
      if (result.success) {
        // Task 155: Redirect to /search after successful login
        const from = location.state?.from?.pathname || '/search';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Failed to authenticate as guest');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Task 153: Feature list
  const features = [
    {
      icon: Search,
      title: 'Search YouTube Videos',
      description: 'Search and analyze any YouTube video instantly',
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Get engagement metrics, views, and performance insights',
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Discover optimal posting times and content strategies',
    },
    {
      icon: Shield,
      title: 'No Account Required',
      description: 'Start exploring immediately as a guest user',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg flex items-center justify-center p-8">
      {/* Task 152: Wide layout - 1200px centered container */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Guest Authentication */}
          <div className="space-y-8">
            {/* Task 153: Large icon and branding */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg">
                <Zap className="text-white" size={32} />
              </div>
              
              <div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                  YouTube Analytics Dashboard
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Professional analytics for content creators
                </p>
              </div>
            </div>

            {/* Task 159: Modern card with shadows */}
            <div className="card p-8 space-y-6 shadow-2xl">
              {/* Task 153: "Start Exploring" CTA */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Start Exploring as Guest
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  No account needed. Get instant access to powerful YouTube analytics tools.
                </p>
              </div>

              {/* Task 157: Error display */}
              {(error || authError) && (
                <ErrorAlert 
                  message={error || authError} 
                  onClose={() => setError(null)} 
                />
              )}

              {/* Task 155-156: Login button with loading state */}
              <button
                onClick={handleGuestLogin}
                disabled={isLoggingIn || loading}
                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn || loading ? (
                  <LoadingSpinner text="" size="small" />
                ) : (
                  <>
                    <span>Continue as Guest</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Task 154 & 160: Session duration and quota information */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      24-Hour Session
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Full access with automatic session management
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <BarChart3 className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      100 Searches Per Day
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Generous daily quota for your analytics needs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features & Preview */}
          <div className="space-y-8">
            {/* Task 153: Feature list */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                What You'll Get
              </h3>
              
              <div className="space-y-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="card p-4 flex items-start gap-4 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="text-primary-600 dark:text-primary-400" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task 158: Dashboard preview screenshot */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dashboard Preview
              </h3>
              
              {/* Task 158: 800px wide preview */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 aspect-video flex items-center justify-center border border-primary-200 dark:border-primary-800">
                {/* Placeholder - Replace with actual screenshot */}
                <div className="text-center space-y-3 p-8">
                  <BarChart3 className="mx-auto text-primary-600 dark:text-primary-400" size={48} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Professional analytics dashboard with real-time insights
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-primary-600 dark:text-primary-400">
                    <CheckCircle2 size={14} />
                    <span>Live Preview Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;