// src/components/Brochure.js
import React from 'react';
import '../Css/brochure.css'
const Brochure = () => {
    const brochureUrl = "/brochure.pdf";

    return (
        <div className='brochure-container'>
            <h2>Download Our Brochure</h2>
            <h4>SIT Central Information Brochure</h4>
            <a href={brochureUrl} download className='button1'>
                Download Brochure
            </a>
        </div>
    );
};

export default Brochure;
