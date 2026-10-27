import React from 'react';
import '../Css/contact.css'

const Contact = () => (
    <div style={contactPageStyle} class="a1">
        <h2>Contact Us</h2>
        <p>Emails:</p>
        <p>Director: <a href="mailto:director@sitpune.edu.in">director@sitpune.edu.in</a></p>
        <p>Admin Officer: <a href="mailto:adminofficer@sitpune.edu.in">adminofficer@sitpune.edu.in</a></p>
        <p>Phone: <a href="tel:+91-20-61936300/6464/6419">+91-20-61936300/6464/6419</a></p>
        <p>Address: Symbiosis Institute of Technology</p>
        <p>Constituent of SYMBIOSIS INTERNATIONAL (DEEMED UNIVERSITY)</p>
        <p>Near Lupin Research Park, Gram: Lavale,</p>
        <p>Tal: Mulshi, Pune 412 115</p>
    </div>
);

const contactPageStyle = {
    padding: '1rem',
    textAlign: 'center',
};

export default Contact;
