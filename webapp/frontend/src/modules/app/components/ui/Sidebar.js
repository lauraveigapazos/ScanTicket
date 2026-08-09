import {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {logout, tryLoginFromServiceToken} from '../../../../backend/userService';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState(null);

    //load user profile
    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                if (authenticatedUser?.user) {
                    setProfile(authenticatedUser.user);
                }
            },
            (error) => {
                console.error("Failed to authenticate:", error);
            }
        );
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/users/login');
    };


    const handleProfileClick = () => {
        if (profile?.id) {
            navigate(`/profile/${profile.id}`);
            setIsOpen(false);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Inicio', path: '/home', icon: 'home' },
        { label: 'Subir ticket', path: '/receipts/upload', icon: 'upload' },
        { label: 'Historial', path: '/history', icon: 'history' },
        { label: 'Análisis', path: '/statistics', icon: 'analytics' },
        { label: 'Perfil', path: `/profile/${profile?.id}`, icon: 'profile', disabled: !profile?.id },
        { label: 'Ajustes', path: '/settings', icon: 'settings' },
    ];

    return (
        <>
            {/* mobile header */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-timberwolf px-4 flex items-center justify-between z-30 md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-myrtle hover:bg-primary transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>
                <h1 className="text-lg font-bold text-slate-gray font-heading flex-1 ml-4">Este mes</h1>
                <button
                    onClick={handleProfileClick}
                    className="p-2 rounded-full bg-cambridge hover:bg-primary transition-colors flex-shrink-0"
                    aria-label="Profile"
                    title="Ver perfil"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </button>
            </div>

            {/* mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen w-56 bg-myrtle shadow-lg z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:fixed md:w-64 md:z-auto flex flex-col`}
            >
                {/* logo + close button */}
                <div className="p-4 md:p-6 pt-6 md:pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 md:h-6 md:w-6 text-cambridge flex-shrink-0"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                            <path d="M8 10h8" />
                            <path d="M8 14h4" />
                        </svg>
                        <h1 className="text-lg md:text-xl font-bold text-cambridge font-heading">ScanTicket</h1>
                    </div>

                    {/* mobile close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-1 hover:bg-cambridge/20 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-cambridge"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* menu items */}
                <nav className="flex-1 px-3 md:px-4 py-4 md:py-6 space-y-1 md:space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors font-heading text-xs md:text-sm font-semibold
                ${
                                isActive(item.path)
                                    ? 'bg-cambridge text-white'
                                    : 'text-cambridge hover:bg-cambridge/30'
                            }`}
                        >
                            {renderIcon(item.icon)}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* logout button */}
                <div className="px-4 py-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-gray hover:bg-cambridge/30 transition-colors font-heading text-sm font-semibold"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

function renderIcon(iconName) {
    const iconClass = 'h-4 w-4 md:h-5 md:w-5 flex-shrink-0';

    switch (iconName) {
        case 'home':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
            );
        case 'upload':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
            );
        case 'history':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            );
        case 'analytics':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
                    <polyline points="17 6 23 6 23 12" />
                </svg>
            );
        case 'profile':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case 'settings':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m0 5.08l-4.24 4.24M20 4.22l-4.24 4.24m0 5.08l4.24 4.24M1 12h6m6 0h6" />
                </svg>
            );
        default:
            return null;
    }
}

export default Sidebar;