import {createBrowserRouter} from 'react-router-dom';

import App from '../layout/App';
import RequireAuth from './RequireAuth';
import LoginForm from '../../features/login/LoginForm';
import Scans from '../../features/pages/Scans';
import Results from '../../features/pages/Results';
import StartScan from '../../features/pages/StartScan';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children:[
            {element: <RequireAuth/>,  children:[
                // Protected routes go here
                {index: true, element: <Scans />},
                {path: 'Scan', element: <Scans />},
                {path: 'Results', element: <Results/>},
                {path: 'StartScan', element: <StartScan/>}

            ]},
            // Public routes go here
            {path: 'login', element: <LoginForm/>},
        ]
    }
]);