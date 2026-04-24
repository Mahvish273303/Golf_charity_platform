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
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 shadow-lg shadow-slate-100/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="inline-block h-3.5 w-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 shadow-md" />
          <span className="text-sm font-extrabold tracking-wide text-indigo-700 transition group-hover:text-indigo-600">
            Golf Charity Platform
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link
            to="/charities"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            Charities
          </Link>
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Dashboard
              </Link>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition-all duration-300 hover:bg-violet-100"
                >
                  Admin
                </Link>
              ) : null}
              <Button className="px-3 py-2 text-xs" onClick={onLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
