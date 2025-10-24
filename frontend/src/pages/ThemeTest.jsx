/**
 * Task 100: Theme Test Page
 * Test all Tailwind theme customizations on 1920x1080 screen
 */
import { useState } from 'react';

const ThemeTestPage = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-8">
      <div className="container-desktop">
        
        {/* Header with Dark Mode Toggle */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-display text-gradient">Theme Test</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Tasks 91-100 Verification
            </p>
          </div>
          <button 
            onClick={toggleDarkMode}
            className="btn-primary"
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Task 91: Color Palette Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 91: Custom Color Palette</h2>
          <div className="grid grid-cols-5 gap-4">
            {/* Primary Colors */}
            <div className="card p-4">
              <div className="text-sm font-medium mb-2">Primary</div>
              <div className="space-y-2">
                <div className="h-8 bg-primary-400 rounded"></div>
                <div className="h-8 bg-primary-500 rounded"></div>
                <div className="h-8 bg-primary-600 rounded"></div>
              </div>
            </div>
            
            {/* YouTube Colors */}
            <div className="card p-4">
              <div className="text-sm font-medium mb-2">YouTube</div>
              <div className="space-y-2">
                <div className="h-8 bg-youtube-light rounded"></div>
                <div className="h-8 bg-youtube rounded"></div>
                <div className="h-8 bg-youtube-dark rounded"></div>
              </div>
            </div>
            
            {/* Engagement Colors */}
            <div className="card p-4">
              <div className="text-sm font-medium mb-2">Engagement</div>
              <div className="space-y-2">
                <div className="h-8 bg-engagement-high rounded"></div>
                <div className="h-8 bg-engagement-medium rounded"></div>
                <div className="h-8 bg-engagement-low rounded"></div>
              </div>
            </div>
            
            {/* Dark Mode Colors */}
            <div className="card p-4">
              <div className="text-sm font-medium mb-2">Dark Mode</div>
              <div className="space-y-2">
                <div className="h-8 bg-dark-bg rounded border border-dark-border"></div>
                <div className="h-8 bg-dark-surface rounded border border-dark-border"></div>
                <div className="h-8 bg-dark-border rounded"></div>
              </div>
            </div>
            
            {/* Status Colors */}
            <div className="card p-4">
              <div className="text-sm font-medium mb-2">Status</div>
              <div className="flex gap-2">
                <span className="badge-success">Success</span>
                <span className="badge-warning">Warning</span>
                <span className="badge-danger">Danger</span>
              </div>
            </div>
          </div>
        </section>

        {/* Task 93: Chart Colors Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 93: Chart Colors (10 Distinct)</h2>
          <div className="card p-6">
            <div className="grid grid-cols-10 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="text-center">
                  <div className={`h-24 rounded-xl bg-chart-${i} mb-2`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Chart {i}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Task 94: Custom Spacing Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 94: Custom Spacing</h2>
          <div className="card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-18 h-18 bg-primary-500 rounded flex items-center justify-center text-white">
                  18 (4.5rem)
                </div>
                <div className="w-88 h-18 bg-primary-500 rounded flex items-center justify-center text-white">
                  88 (22rem)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Task 95: Border Radius Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 95: Modern Border Radius</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="card p-6 rounded-xl">
              <div className="font-medium mb-2">rounded-xl</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">1rem</div>
            </div>
            <div className="card p-6 rounded-2xl">
              <div className="font-medium mb-2">rounded-2xl</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">1.5rem</div>
            </div>
            <div className="card p-6 rounded-3xl">
              <div className="font-medium mb-2">rounded-3xl</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">2rem</div>
            </div>
            <div className="card p-6 rounded-3xl shadow-card-hover">
              <div className="font-medium mb-2">card-hover shadow</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hover effect</div>
            </div>
          </div>
        </section>

        {/* Task 96: Typography Plugin Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 96: Typography Plugin</h2>
          <div className="card p-6">
            <article className="prose dark:prose-invert max-w-none">
              <h3>Sample Rich Text Content</h3>
              <p>
                This content uses the <code>@tailwindcss/typography</code> plugin.
                It provides beautiful typographic defaults for HTML you don't control,
                like content from a CMS or markdown files.
              </p>
              <ul>
                <li>Automatic spacing and sizing</li>
                <li>Dark mode support</li>
                <li>Code block styling</li>
              </ul>
              <blockquote>
                "Design is not just what it looks like and feels like. Design is how it works."
                — Steve Jobs
              </blockquote>
            </article>
          </div>
        </section>

        {/* Task 97: Desktop-Only Breakpoints Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 97: Desktop-Only Breakpoints</h2>
          <div className="card p-6">
            <div className="space-y-4">
              <div className="desktop:bg-primary-500 wide:bg-purple-500 ultrawide:bg-pink-500 p-4 rounded text-white text-center font-medium">
                <div>Current breakpoint:</div>
                <div className="desktop:block wide:hidden ultrawide:hidden">Desktop (1024px+)</div>
                <div className="hidden wide:block ultrawide:hidden">Wide (1440px+)</div>
                <div className="hidden ultrawide:block">Ultra Wide (1920px+)</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Window width: <span id="window-width" className="font-mono"></span>px
              </div>
            </div>
          </div>
        </section>

        {/* Task 98: Animation Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 98: Custom Animations</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="card p-6 animate-fade-in">
              <div className="font-medium mb-2">fade-in</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">0.3s ease</div>
            </div>
            <div className="card p-6 animate-slide-up">
              <div className="font-medium mb-2">slide-up</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">0.4s ease-out</div>
            </div>
            <div className="card p-6 animate-scale-in">
              <div className="font-medium mb-2">scale-in</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">0.2s ease-out</div>
            </div>
            <div className="card p-6 animate-pulse-slow">
              <div className="font-medium mb-2">pulse-slow</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">3s infinite</div>
            </div>
          </div>
        </section>

        {/* Task 99: Gradient Utilities Test */}
        <section className="mb-12">
          <h2 className="section-title">Task 99: Gradient Utilities</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="h-48 bg-gradient-dark rounded-2xl flex items-center justify-center">
              <span className="text-white font-medium">gradient-dark</span>
            </div>
            <div className="h-48 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-medium">primary → purple</span>
            </div>
            <div className="h-48 bg-gradient-radial from-pink-500 to-purple-900 rounded-2xl flex items-center justify-center">
              <span className="text-white font-medium">gradient-radial</span>
            </div>
          </div>
          
          {/* Gradient Text */}
          <div className="card p-6 mt-6 text-center">
            <div className="text-6xl font-bold text-gradient mb-4">
              Gradient Text Effect
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Using the <code className="text-primary-600">.text-gradient</code> utility
            </p>
          </div>
        </section>

        {/* Button Showcase */}
        <section className="mb-12">
          <h2 className="section-title">Button Styles</h2>
          <div className="card p-6">
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-danger">Danger Button</button>
              <button className="btn-primary" disabled>Disabled Button</button>
            </div>
          </div>
        </section>

        {/* Input Showcase */}
        <section className="mb-12">
          <h2 className="section-title">Input Styles</h2>
          <div className="card p-6">
            <div className="space-y-4 max-w-2xl">
              <input type="text" className="input" placeholder="Large desktop input (48px min-height)" />
              <textarea className="input" rows="4" placeholder="Textarea with custom styles"></textarea>
            </div>
          </div>
        </section>

        {/* Stat Cards Showcase */}
        <section className="mb-12">
          <h2 className="section-title">Stat Cards</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="stat-value">1.2M</div>
              <div className="stat-label">Total Views</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">4.5%</div>
              <div className="stat-label">Engagement</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">50</div>
              <div className="stat-label">Videos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">Sunday</div>
              <div className="stat-label">Best Day</div>
            </div>
          </div>
        </section>

        {/* Success Message */}
        <div className="card p-8 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">All Theme Tests Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tasks 91-100 verified on desktop screen
          </p>
        </div>

      </div>

      {/* Window Width Display Script */}
      <script dangerouslySetInnerHTML={{__html: `
        function updateWidth() {
          const el = document.getElementById('window-width');
          if (el) el.textContent = window.innerWidth;
        }
        updateWidth();
        window.addEventListener('resize', updateWidth);
      `}} />
    </div>
  );
};

export default ThemeTestPage;