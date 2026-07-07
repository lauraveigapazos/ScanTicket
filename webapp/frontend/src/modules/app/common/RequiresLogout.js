import { Navigate, Outlet } from 'react-router-dom';
import { getServiceToken } from '../../../backend/appFetch';

const RequiresLogout = () => {
    const serviceToken = getServiceToken();

    if (serviceToken) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default RequiresLogout;