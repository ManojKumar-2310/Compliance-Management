import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background dark:bg-slate-900 pl-64 transition-all duration-300">
            <Sidebar />
            {/* Theme Toggle for Dashboard Pages */}
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>
            <main className="p-10 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
