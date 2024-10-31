import React from 'react';
import logo from '../assets/logo.png';

const Header = () => (
    <header style={headerStyle}>
        <div style={logoStyle}>
            <img src={logo} alt="College Logo" style={{ width: '140px', height: '60px' , paddingLeft:'40px'}} />
        </div>
        <nav>
            <ul style={navStyle}>
                <li><a href="/" style={linkStyle}>Home</a></li>
                <li><a href="/news" style={linkStyle}>News</a></li>
                <li><a href="/events" style={linkStyle}>Events</a></li>
            </ul>
        </nav>
    </header>
);

const headerStyle = {
    backgroundColor: '#004080',
    color: 'white',
    padding: '1rem',
    textAlign: 'center'
};

const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const navStyle = {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
};

const linkStyle = {
    color: 'white',
    textDecoration: 'none',
};

export default Header;
