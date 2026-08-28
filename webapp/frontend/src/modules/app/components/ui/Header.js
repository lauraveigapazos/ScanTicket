import { useNavigate } from 'react-router-dom';
import '../../../../styles/header.css';

const Header = ({ user, onMenuClick, title = "Este mes", showProfile = true }) => {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        if (user?.id) {
            navigate(`/profile/${user.id}`);
        }
    };

    return (
        <>
            {/* mobile header */}
            <header className="home-header-top">
                <button
                    onClick={onMenuClick}
                    className="home-header-menu-button"
                    aria-label="Toggle menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="home-header-menu-icon" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                <h1 className="home-header-mobile-title">{title}</h1>
                {user ? (
                    <button onClick={handleProfileClick} className="home-header-profile-button" aria-label="Profile">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-gray" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </button>
                ) : null}
            </header>

            {/* desktop header */}
            <header className="home-header-content">
                <h1 className="home-header-title">{title}</h1>
                {user ? (
                    <button onClick={handleProfileClick} className="home-header-profile-button" aria-label="Profile">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-gray" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                             strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </button>
                ) : null}
            </header>
            <div className="home-header-divider hidden md:block"></div>
        </>
    );
};

export default Header;