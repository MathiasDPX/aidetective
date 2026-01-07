
import React, { useState, useEffect } from 'react';
import { InvestigationCase } from './types';

import { dbService } from './services/dbService';
import Workspace from './components/Workspace';

const App: React.FC = () => {
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCase();
  }, []);

  const loadCase = async () => {
    try {
      setIsLoading(true);
      const caseData = await dbService.getCase();
      setActiveCase(caseData);
    } catch (error) {
      console.error('Failed to load case:', error);
      setActiveCase(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-serif text-lg">Loading case...</p>
        </div>
      </div>
    );
  }

  if (!activeCase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-white/60 font-serif text-lg">Case not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Workspace
        activeCase={activeCase}
        onBack={() => {}}
        onUpdateCase={() => {}}
      />
    </div>
  );
};

export default App;
