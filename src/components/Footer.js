import React from 'react';


const Footer = () => (
    <footer style={footerStyle}>
        <p>&copy; 2024 College E-News | <a href="/about" style={fstyle}>About</a> | <a href="info" style={fstyle}>Contact</a></p>
    </footer>
);

const footerStyle = {
    backgroundColor: '#333',
    color: 'white',
    textAlign: 'center',
    padding: '1rem',
    marginTop: '2rem'
};
const fstyle ={
    color: 'white',
    textDecoration: 'none'
}

export default Footer;
