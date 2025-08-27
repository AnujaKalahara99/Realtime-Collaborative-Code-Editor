import { supabase } from "../../database/superbase";
import { LogOut } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeProvider";
import { useNavigate } from "react-router";
import { type Session } from "@supabase/supabase-js";
import ThemeToggleButton from "../../components/ThemeToggleBtn";

const TitleBar = ({ Session }: { Session: Session }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const user = Session.user;
  const avatar = user.user_metadata.avatar_url;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  // const goToCodeEditor = () => {
  //   navigate("/codeeditor");
  // };
  return (
    <header
      className={`${theme.surface} ${theme.border} border-b sticky top-0 z-10`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className={`text-2xl font-medium ${theme.text}`}>Codespaces</h1>
          </div>

          <div className="flex items-center space-x-3">
            {avatar && (
              <img
                src={avatar}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                onClick={goToProfile}
              />
            )}

            <button
              onClick={signOut}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${theme.hover} ${theme.textSecondary} transition-colors`}
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </button>
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TitleBar;
