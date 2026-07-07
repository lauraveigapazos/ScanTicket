import { useNavigate } from 'react-router-dom';

const Header = ({ user }) => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-timberwolf/30">
            <div className="flex items-center justify-between px-4 py-3">
                <h1 className="text-xl font-bold text-myrtle tracking-tight">
                    ScanTicket
                </h1>

                {user ? (
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 rounded-full bg-myrtle/10 flex items-center justify-center
                       text-myrtle hover:bg-myrtle/20 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24"
                             fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>
                ) : null}
            </div>
        </header>
    );
};

export default Header;