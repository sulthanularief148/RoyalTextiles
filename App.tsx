import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import Customers from './components/Customers';
import Settings from './components/Settings';
import AIHub from './components/AIHub';
import Login from './components/Login';
import Toast, { ToastType } from './components/Toast';
import { ViewState } from './types';
import { seedDatabase } from './services/db';

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  // Notification State
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    // Initialize DB with seed data on load
    seedDatabase();
  }, []);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    showToast('Welcome back, Admin!', 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView(ViewState.DASHBOARD);
    showToast('Logged out successfully', 'info');
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.INVENTORY:
        return <Inventory />;
      case ViewState.POS:
        return <POS showToast={showToast} />;
      case ViewState.CUSTOMERS:
        return <Customers showToast={showToast} />;
      case ViewState.SETTINGS:
        return <Settings showToast={showToast} />;
      case ViewState.AI_ASSISTANT:
        return <AIHub />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toast 
          message={toast.message} 
          type={toast.type} 
          isVisible={toast.isVisible} 
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onLogout={handleLogout}
      />
      <main className="ml-64 flex-1 p-8 h-screen overflow-y-auto">
        {renderView()}
      </main>
      
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}

export default App;