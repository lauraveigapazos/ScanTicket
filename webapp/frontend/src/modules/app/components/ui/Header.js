import { useNavigate } from 'react-router-dom';
import '../../../../styles/header.css';

//sidebar pages get the menu button (mobile only); sub-pages pass onBack and get a back arrow instead.
//children replace the profile button on the right (page actions like a month picker or logout)
const Header = ({ user, onMenuClick, onBack, title = "Este mes", children }) => {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        if (user?.id) {
            navigate(`/profile/${user.id}`);
        }
    };

    const right = children || (user ? (
        <button onClick={handleProfileClick} className="home-header-profile-button" aria-label="Profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-gray" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                 strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
            </svg>
        </button>
    ) : <div className="w-10 md:hidden"/>);

    return (
        <>
            <header className="home-header">
                <div className="home-header-left">
                    {onBack ? (
                        <button onClick={onBack} className="home-header-back-button" aria-label="Volver">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6"/>
                            </svg>
                        </button>
                    ) : (
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
                    )}
                    <h1 className="home-header-title">{title}</h1>
                </div>
                {right}
            </header>
            {/* mobile header is fixed-> reserve height */}
            <div className="h-16 md:hidden"></div>
            <div className="home-header-divider hidden md:block"></div>
        </>
    );
};

export default Header;
