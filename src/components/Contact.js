import React from 'react';

const Contact = () => (
    <div style={contactPageStyle}>
        <h2>Contact Us</h2>
        <p>Email: <a href="mailto:info@college.edu">info@college.edu</a></p>
        <p>Phone: <a href="tel:+123456789">+1 234 567 89</a></p>
        <p>Address: 123 College Ave, City, State</p>
    </div>
);

const contactPageStyle = {
    padding: '2rem',
    textAlign: 'center'
};

export default Contact;
