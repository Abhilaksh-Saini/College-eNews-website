// src/components/Brochure.js
import React from 'react';

const Brochure = () => {
    const brochureUrl = "/brochure.pdf";

    return (
        <div style={brochureContainerStyle}>
            <h2>Download Our Brochure</h2>
            <h4>SIT Central Information Brochure</h4>
            <a href={brochureUrl} download style={buttonStyle}>
                Download Brochure
            </a>
        </div>
    );
};

const brochureContainerStyle = {
    textAlign: 'center',
    margin: '2rem 0',
};

const buttonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#004080',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
};

export default Brochure;
