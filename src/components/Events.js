import React from 'react';

const Events = () => (
    <section>
        <h2>Events</h2>
        <div className="event-list">
            <div className="event-item">
                <h3><i>Recent Events: </i>Introduction to Full Stack Development Workshop</h3>
                <p></p>
                <a href="/fullstack-event">See details</a>
            </div>
            <div className="event-item">
                <h3><i>Upcoming Events: </i>SymbiTech 2025- Technological Festival</h3>
                <a href="/symbitech-event">See details</a>
            </div>
        </div>
    </section>
);

export default Events;
