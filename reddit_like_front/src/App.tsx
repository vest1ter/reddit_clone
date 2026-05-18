import { Suspense, lazy, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Feed } from "./components/Feed";
import { Registration } from "./components/Registration";
import { Login } from "./components/Login";
import { VerifyEmail } from "./components/VerifyEmail";
import { Button } from "./components/ui/button";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { getPublicSiteUrl } from "./lib/publicSiteUrl";

const Settings = lazy(async () => {
  const m = await import("./components/Settings");
  return { default: m.Settings };
});
const CreatePost = lazy(async () => {
  const m = await import("./components/CreatePost");
  return { default: m.CreatePost };
});
const AdminRoles = lazy(async () => {
  const m = await import("./components/AdminRoles");
  return { default: m.AdminRoles };
});

const Home = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogIn = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Menu = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PageSpinner = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-center text-muted-foreground" role="status" aria-live="polite">
    Loading page…
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="max-w-3xl mx-auto py-6 px-4 text-center text-muted-foreground">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="max-w-3xl mx-auto py-6 px-4 text-center text-muted-foreground">Loading...</div>;
  }
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const site = getPublicSiteUrl();
  const url = `${site}/login`;
  return (
    <>
      <Helmet>
        <title>Sign in — Reddit-like</title>
        <meta name="description" content="Sign in to Reddit-like to post, comment, and manage your profile." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sign in — Reddit-like" />
        <meta property="og:description" content="Sign in to your account." />
        <meta property="og:url" content={url} />
      </Helmet>
      <Login
        onSwitchToRegister={() => navigate("/register")}
        onLoginSuccess={() => navigate("/")}
        onRequireEmailVerification={() => navigate("/verify-email")}
      />
    </>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const site = getPublicSiteUrl();
  const url = `${site}/register`;
  return (
    <>
      <Helmet>
        <title>Create account — Reddit-like</title>
        <meta name="description" content="Create a Reddit-like account. Verify your email to start posting." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Create account — Reddit-like" />
        <meta property="og:description" content="Register for Reddit-like." />
        <meta property="og:url" content={url} />
      </Helmet>
      <Registration
        onSwitchToLogin={() => navigate("/login")}
        onRegistrationSuccess={() => navigate("/")}
        onRequireEmailVerification={(email) => navigate(`/verify-email?email=${encodeURIComponent(email)}`)}
      />
    </>
  );
};

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const emailFromQuery = params.get("email") ?? "";
  const site = getPublicSiteUrl();
  const url = `${site}/verify-email`;
  return (
    <>
      <Helmet>
        <title>Verify email — Reddit-like</title>
        <meta name="description" content="Confirm your email address to activate your Reddit-like account." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Verify email — Reddit-like" />
        <meta property="og:url" content={url} />
      </Helmet>
      <VerifyEmail
        initialEmail={emailFromQuery}
        onVerified={() => navigate("/")}
        onBackToLogin={() => navigate("/login")}
        onBackToRegister={() => navigate("/register")}
      />
    </>
  );
};

const SettingsPage = () => {
  const site = getPublicSiteUrl();
  const url = `${site}/settings`;
  return (
    <>
      <Helmet>
        <title>Profile settings — Reddit-like</title>
        <meta name="description" content="Manage your Reddit-like profile and preferences." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Profile settings — Reddit-like" />
        <meta property="og:url" content={url} />
      </Helmet>
      <Suspense fallback={<PageSpinner />}>
        <Settings />
      </Suspense>
    </>
  );
};

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { bumpFeed } = useAuth();
  const site = getPublicSiteUrl();
  const url = `${site}/create-post`;
  return (
    <>
      <Helmet>
        <title>Create post — Reddit-like</title>
        <meta name="description" content="Create a new post in a thread on Reddit-like." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Create post — Reddit-like" />
        <meta property="og:url" content={url} />
      </Helmet>
      <Suspense fallback={<PageSpinner />}>
        <CreatePost
          onPostCreated={() => {
            bumpFeed();
            navigate("/");
          }}
          onCancel={() => navigate("/")}
        />
      </Suspense>
    </>
  );
};

const AdminPage = () => {
  const site = getPublicSiteUrl();
  const url = `${site}/admin`;
  return (
    <>
      <Helmet>
        <title>Admin — roles</title>
        <meta name="description" content="Administrator tools for user roles." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Admin — Reddit-like" />
        <meta property="og:url" content={url} />
      </Helmet>
      <Suspense fallback={<PageSpinner />}>
        <AdminRoles />
      </Suspense>
    </>
  );
};

const FeedRoute = () => {
  const { refetch, feedRefreshTrigger } = useAuth();
  return <Feed refreshTrigger={feedRefreshTrigger} onRefresh={refetch} />;
};

const AppShell = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md" aria-label="Reddit-like home">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground">R</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Reddit-like</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
            <NavLink to="/" end className={navClass}>
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Feed</span>
            </NavLink>
            <Button
              type="button"
              variant="default"
              className="gap-2 bg-primary text-primary-foreground"
              onClick={() => {
                if (!user) {
                  navigate("/login");
                  return;
                }
                navigate("/create-post");
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Post</span>
            </Button>
            {user ? (
              <>
                <NavLink to="/settings" className={navClass}>
                  <SettingsIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </NavLink>
                {user.role === "admin" && (
                  <NavLink to="/admin" className={navClass}>
                    <SettingsIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </NavLink>
                )}
                <span className="text-muted-foreground text-sm">u/{user.username}</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </NavLink>
                <NavLink to="/register" className={navClass}>
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Register</span>
                </NavLink>
              </>
            )}
          </nav>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-nav" className="md:hidden border-t border-border bg-card px-4 py-3">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              <NavLink to="/" end className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                <Home className="h-4 w-4" />
                <span>Feed</span>
              </NavLink>
              <Button
                type="button"
                variant="default"
                className="gap-2 bg-primary text-primary-foreground justify-start"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  navigate("/create-post");
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </Button>
              {user ? (
                <>
                  <NavLink to="/settings" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                    <SettingsIcon className="h-4 w-4" />
                    <span>Profile</span>
                  </NavLink>
                  {user.role === "admin" && (
                    <NavLink to="/admin" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                      <SettingsIcon className="h-4 w-4" />
                      <span>Admin</span>
                    </NavLink>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </NavLink>
                  <NavLink to="/register" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="bg-muted/20 flex-1">
        {loading ? (
          <div className="max-w-3xl mx-auto py-6 px-4 text-center text-muted-foreground">Loading...</div>
        ) : (
          <Outlet />
        )}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">&copy; 2025 Reddit-like. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route index element={<FeedRoute />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="verify-email" element={<VerifyEmailPage />} />
      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="create-post"
        element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
