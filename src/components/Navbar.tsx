import React from 'react';
import './Navbar.css';

interface NavbarProps {
    toggleDrawer: () => void;
    showTitle: boolean;
    title: string | null;
    isMenuOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDrawer, showTitle, title, isMenuOpen }) => {
    return (
        <div className="navbar">
            <button className={`navbar__menu-btn ${isMenuOpen ? 'open' : ''}`} onClick={toggleDrawer} aria-label="Toggle Menu">
                <span className="navbar__menu-icon"></span>
                <span className="navbar__menu-icon"></span>
                <span className="navbar__menu-icon"></span>
            </button>

            {showTitle && title && (
                <h1 className="navbar__title">{title}</h1>
            )}
        </div>
    );
};

export default Navbar;