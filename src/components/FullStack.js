import React from 'react';

function FS() {
  return (
    <div>
      <section>
        <h1 style={{ padding: '0.5rem', textAlign: 'center' }}><i>Introduction to Full Stack Development Workshop</i></h1>
        <p style={{ padding: '0.5rem', textAlign: 'center' }}>
          Full stack development has become a critical skill in the tech industry, combining front-end and back-end expertise to build complete software solutions. 
          The Codex Event covered the essentials of this discipline, from web architecture to frameworks like Python Flask and React.js.
        </p>
      </section>

      <section>
        <h2>Basic Architecture of Web Applications</h2>
        <p>
          The Codex event explored the three layers of web applications:
        </p>
        <ul>
          <li><strong>Client Layer (Front-End):</strong> The user-facing side, built with HTML, CSS, JavaScript, and frameworks like React.js.</li>
          <li><strong>Server Layer (Back-End):</strong> Processes requests and business logic, using frameworks such as Flask.</li>
          <li><strong>Database Layer:</strong> Manages data storage and retrieval with databases like MySQL and MongoDB.</li>
        </ul>
        <p>
          These layers form the foundation of a web application, enabling seamless communication between the user interface and data management.
        </p>
      </section>

      <section>
        <h2>Building the Back-End with Python Flask</h2>
        <p>
          Flask, a lightweight Python framework, was featured in a workshop where attendees learned to build scalable back-end systems. 
          Highlights included setting up a Flask app, defining routes, handling data, and running the application.
        </p>
        <ul>
          <li><strong>Setting Up:</strong> Initializing a basic Flask app and exploring project structure.</li>
          <li><strong>Creating Routes:</strong> Defining URL endpoints to handle client requests.</li>
          <li><strong>Data Handling:</strong> Integrating Flask with databases and processing data requests.</li>
        </ul>
        <p>
          The workshop provided attendees with foundational knowledge for developing back-ends that interact seamlessly with the front-end.
        </p>
      </section>

      <section>
        <h2>Building the Front-End with React.js</h2>
        <p>
          React.js, a JavaScript library for creating dynamic UIs, was another major topic. Participants learned to build interactive front-ends with reusable components, manage state, 
          and integrate with the back-end.
        </p>
        <ul>
          <li><strong>Setting Up:</strong> Creating a React app using Create React App.</li>
          <li><strong>Building Components:</strong> Developing modular, reusable components like headers and footers.</li>
          <li><strong>Managing State and Props:</strong> Storing and passing data between components to enhance interactivity.</li>
          <li><strong>API Integration:</strong> Connecting the React front-end to the Flask back-end.</li>
        </ul>
        <p>
          The session emphasized the value of React in building scalable and responsive applications.
        </p>
      </section>
    </div>
  );
}

export default FS;

