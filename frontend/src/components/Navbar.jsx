import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E1DC] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#3A2E2A]" />
          <span className="text-sm font-bold tracking-tight text-[#1F1F1F]">
            Golf Charity Platform
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            to="/charities"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#6B6B6B] transition-colors duration-200 hover:bg-[#F5F3F0] hover:text-[#1F1F1F]"
          >
            Charities
          </Link>
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#6B6B6B] transition-colors duration-200 hover:bg-[#F5F3F0] hover:text-[#1F1F1F]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn-primary ml-1 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#6B6B6B] transition-colors duration-200 hover:bg-[#F5F3F0] hover:text-[#1F1F1F]"
              >
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#6B6B6B] transition-colors duration-200 hover:bg-[#F5F3F0] hover:text-[#1F1F1F]"
              >
                Tasks
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#A68A64] transition-colors duration-200 hover:bg-[#F5F3F0]"
                >
                  Admin
                </Link>
              ) : null}
              <Button variant="dark" className="ml-1 px-3 py-2 text-xs" onClick={onLogout}>
                Logout
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
