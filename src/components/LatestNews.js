import React from 'react';

const LatestNews = () => (
    <section>
        <h2>Latest News</h2>
        <div className="news-list">
            <div className="news-item">
                <h3>News Title</h3>
                <p>Brief description of the news item.</p>
                <a href="/news">Read more</a>
            </div>
            <div className="news-item">
                <h3>Another News Title</h3>
                <p>Brief description of the news item.</p>
                <a href="/news">Read more</a>
            </div>
        </div>
    </section>
);

export default LatestNews;
