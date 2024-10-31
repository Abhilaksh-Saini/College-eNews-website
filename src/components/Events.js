import React from 'react';

const Events = () => (
    <section>
        <h2>Upcoming Events</h2>
        <div className="event-list">
            <div className="event-item">
                <h3>Event Title</h3>
                <p>Event date, time, and location.</p>
                <a href="/events">See details</a>
            </div>
            <div className="event-item">
                <h3>Another Event Title</h3>
                <p>Event date, time, and location.</p>
                <a href="/events">See details</a>
            </div>
        </div>
    </section>
);

export default Events;
