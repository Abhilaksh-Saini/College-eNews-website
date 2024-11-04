import React from 'react';
import logo from '../assets/logo.png';
import '../Css/header.css';
const Header = () => (
    <header>
        <div className='logo'>
            <img src={logo} alt="College Logo" style={{ width: '140px', height: '60px' , paddingLeft:'40px'}} />
        </div>
        <nav>
            <ul className='nav'>
                <li><a href="/" className='link'>Home</a></li>
                <li><a href="/news" className='link'>News</a></li>
                <li><a href="/events" className='link'>Events</a></li>
                <li><a href="/brochure" className='link'>Info-Brochure</a></li>
            </ul>
        </nav>
    </header>
);


export default Header;
