import {logout} from "../../../backend/userService";
import {useNavigate} from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/users/login');
    };

    return (
        <div className="min-h-screen bg-smoke flex items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-myrtle mb-2">
                    ¡Login exitoso!
                </h1>
                <p className="text-cambridge font-sans mb-6">
                    Has iniciado sesión correctamente
                </p>
                <button onClick={handleLogout} className="btn-secondary">
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
};

export default Home;
