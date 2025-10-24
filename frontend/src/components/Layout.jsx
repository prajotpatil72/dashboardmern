/**
 * Layout Component (Tasks 141-142)
 * Desktop-optimized main layout with fixed sidebar and top navbar
 * 
 * DESKTOP DESIGN:
 * - Fixed sidebar: 240px width
 * - Top navbar: Full width minus sidebar
 * - Main content: Fills remaining space
 * - Min width: 1024px (desktop only)
 */
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Task 142: Fixed Sidebar - 240px */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Task 142: Top Navbar */}
        <Navbar />
        
        {/* Task 142: Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-desktop">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;