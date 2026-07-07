import { Navigate, Outlet } from 'react-router-dom';
import { getServiceToken } from '../../../backend/appFetch';

const RequiresLogin = () => {
    const serviceToken = getServiceToken();

    if (!serviceToken) {
        return <Navigate to="/users/login" replace />;
    }

    return <Outlet />;
};

export default RequiresLogin;