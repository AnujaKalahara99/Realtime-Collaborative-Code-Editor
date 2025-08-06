import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggleButton from '../components/ThemeToggleBtn';
import { useTheme } from '../ThemeProvider';

const CollaboratePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleProceed = () => {
    const codespaceId = 'abc123'; // Replace with actual logic
    navigate(`/codespace/${codespaceId}`);
  };

  return (
    <div className={`flex items-center justify-center h-screen p-6 ${theme.surface}`}>
      <div className={`w-full max-w-md rounded-lg p-8 shadow-md text-center border ${theme.surfaceSecondary} ${theme.border}`}>
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${theme.text}`}>Ready to Collaborate?</h1>
          <ThemeToggleButton size="small" />
        </div>

        <p className={`mb-8 ${theme.textSecondary}`}>
          Click the button below to start collaborating on the codespace.
        </p>

        <button
          onClick={handleProceed}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
        >
          Proceed to Collaborate
        </button>
      </div>
    </div>
  );
};

export default CollaboratePage;
