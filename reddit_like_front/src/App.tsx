import { useState, useEffect } from "react";
import { Feed } from "./components/Feed";
import { Registration } from "./components/Registration";
import { Login } from "./components/Login";
import { Settings } from "./components/Settings";
import { CreatePost } from "./components/CreatePost";
import { AdminRoles } from "./components/AdminRoles";
import { Button } from "./components/ui/button";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

type Page = "feed" | "register" | "login" | "settings" | "create-post" | "admin";

const Home = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogIn = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Menu = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

function AppContent() {
  const { user, loading, refetch, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("feed");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setFeedRefreshTrigger((prev) => prev + 1);
    setCurrentPage("feed");
  };

  const handleNavigate = (page: Page) => {
    if (page === "settings" || page === "create-post") {
      if (!user) {
        setCurrentPage("login");
        return;
      }
    }
    if (page === "admin") {
      if (!user || user.role !== "admin") {
        setCurrentPage("feed");
        return;
      }
    }
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentPage("feed");
    setIsMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "feed":
        return <Feed refreshTrigger={feedRefreshTrigger} onRefresh={refetch} />;
      case "register":
        return (
          <Registration
            onSwitchToLogin={() => setCurrentPage("login")}
            onRegistrationSuccess={() => { refetch(); setCurrentPage("feed"); }}
          />
        );
      case "login":
        return (
          <Login
            onSwitchToRegister={() => setCurrentPage("register")}
            onLoginSuccess={() => { refetch(); setCurrentPage("feed"); }}
          />
        );
      case "settings":
        return user ? <Settings /> : <Feed refreshTrigger={feedRefreshTrigger} onRefresh={refetch} />;
      case "create-post":
        return user ? (
          <CreatePost
            onPostCreated={handlePostCreated}
            onCancel={() => setCurrentPage("feed")}
          />
        ) : (
          <Feed refreshTrigger={feedRefreshTrigger} onRefresh={refetch} /> 
        );
      case "admin":
        return user?.role === "admin" ? <AdminRoles /> : <Feed refreshTrigger={feedRefreshTrigger} onRefresh={refetch} />;
      default:
        return <Feed refreshTrigger={feedRefreshTrigger} onRefresh={refetch} />;
    }
  };

  const NavButton = ({
    page,
    icon: Icon,
    label,
  }: {
    page: Page;
    icon: typeof Home;
    label: string;
  }) => (
    <Button
      variant={currentPage === page ? "default" : "ghost"}
      className={`gap-2 ${
        currentPage === page
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      onClick={() => handleNavigate(page)}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground">R</span>
            </div>
            <h2 className="text-foreground">Reddit-like</h2>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavButton page="feed" icon={Home} label="Feed" />
            <Button
              variant="default"
              className="gap-2 bg-primary text-primary-foreground"
              onClick={() => handleNavigate("create-post")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Post</span>
            </Button>
            {user ? (
              <>
                <NavButton page="settings" icon={SettingsIcon} label="Profile" />
                {user.role === "admin" && (
                  <NavButton page="admin" icon={SettingsIcon} label="Admin" />
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
                <NavButton page="login" icon={LogIn} label="Sign In" />
                <NavButton page="register" icon={UserPlus} label="Register" />
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3">
            <nav className="flex flex-col gap-2">
              <NavButton page="feed" icon={Home} label="Feed" />
              <Button
                variant="default"
                className="gap-2 bg-primary text-primary-foreground justify-start"
                onClick={() => handleNavigate("create-post")}
              >
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </Button>
              {user ? (
                <>
                  <NavButton page="settings" icon={SettingsIcon} label="Profile" />
                  {user.role === "admin" && <NavButton page="admin" icon={SettingsIcon} label="Admin" />}
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
                  <NavButton page="login" icon={LogIn} label="Sign In" />
                  <NavButton page="register" icon={UserPlus} label="Register" />
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="bg-muted/20">
        {loading ? (
          <div className="max-w-3xl mx-auto py-6 px-4 text-center text-muted-foreground">Loading...</div>
        ) : (
          renderPage()
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Reddit-like. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
