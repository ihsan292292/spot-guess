import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { useSpotifyAuth } from '../auth';
import { useToast } from '../context/Toast';

type ProtectedRouteProps = {
    children: React.ReactNode;
    redirectPath?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectPath = '/' }) => {
    const { isAuthenticated, isCheckingAuthentication } = useSpotifyAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!isCheckingAuthentication && !isAuthenticated) {
            showToast('You need to be logged in to access this page.', 'error', 3000);
        }
    }, [isAuthenticated, isCheckingAuthentication, showToast]);

    if (isCheckingAuthentication) return null;

    return isAuthenticated ? <>{children}</> : <Navigate to={redirectPath} replace />;
};


export default ProtectedRoute;
