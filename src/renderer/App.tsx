import React from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Test from './pages/Test';
import Settings from './pages/Settings';
import About from './pages/About';
import { useNavigation } from './store';

function App() {
  const { currentPage } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'test':
        return <Test />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
