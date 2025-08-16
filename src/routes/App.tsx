
import { setUser as sentrySetUser } from "@sentry/react";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom';

import NeonText from '../components/NeonText';
import SideDrawer from '../components/SideDrawer';
import SpotifyLoginButton from '../components/SpotifyLoginButton';
import { ErrorMessage } from "../components/ErrorMessage";
import { useSpotifyAuth } from '../auth';
import Navbar from '../components/Navbar';
import { useTranslation } from '../i18n';

import { RootHome } from './RootHome';

import './App.css';

function App() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const isExactRoot = matchPath({ path: '/', end: true }, location.pathname);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { authenticate, user, logOut, isAuthenticated, isCheckingAuthentication, error } = useSpotifyAuth();

    useEffect(() => {
        if(user){
            sentrySetUser({ username: user?.display_name });
        } else {
            sentrySetUser(null);
        }
    },[user])

    const handleLogOut = useCallback(() => {
        logOut();
        handleDrawerClose();
        navigate("/", {replace: true});
    },[navigate, logOut])

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const showTitle = useMemo(() => {
        return !isExactRoot || (!!isExactRoot && isAuthenticated)
    }, [isExactRoot, isAuthenticated]);

    return (
        <div className="app-container">
            <header className="app-header">
                <Navbar
                    isMenuOpen={drawerOpen}
                    toggleDrawer={toggleDrawer}
                    title={import.meta.env.VITE_APP_NAME}
                    showTitle={showTitle}
                ></Navbar>
            </header>
            <SideDrawer isOpen={drawerOpen} onClose={handleDrawerClose} user={user} logOut={handleLogOut} />
            <div className={`main-content`}>
                {drawerOpen && <div className="overlay" onClick={handleDrawerClose}></div>}

                {!isAuthenticated && !isCheckingAuthentication && isExactRoot && (
                    <div className="not-authenticated-container">
                        <NeonText
                            text={import.meta.env.VITE_APP_NAME}
                            style={{ paddingLeft: '1em', paddingRight: '1em' }}
                        ></NeonText>
                        { error
                             ? <ErrorMessage style={{maxWidth: '600px', marginTop: '1em', marginBottom: '1em', alignSelf: 'center'}} message={error instanceof Error ? JSON.stringify(error): error}/>
                             : <h1 style={{ maxWidth: '400px', marginTop: '1em', marginBottom: '1em' }}>
                                {t("loginRequiredMessage")}
                            </h1>
                        }
                        <SpotifyLoginButton onClick={authenticate} disabled={!!error}>{t("loginWithSpotify")}</SpotifyLoginButton>
                    </div>
                )}
                {isAuthenticated && isExactRoot && <RootHome/>}
                <Outlet />
            </div>
        </div>
    );
}

export default App;
