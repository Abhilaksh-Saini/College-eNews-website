
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import '../Css/header.css';

const articles = [
    {
        id: 1,
        title: "End Semester Examination 2024 Details",
        content: "Details about the college inauguration event.",
        component: <a href="/end-sem-news">End Semester Examination News</a>,
    },
    {
        id: 2,
        title: "ODD-Semester 2024 details and SIT benefits",
        content: "Details about semester start, student guidelines, and SIT benefits.",
        component: <a href="/news1">ODD-Semester News</a>,
    },
    {
        id: 3,
        title: "Introduction to Full Stack Development Workshop",
        content: "Full stack development workshop covering essentials from web architecture to frameworks like Python Flask and React.js.",
        component: <a href="/fullstack-event">Full Stack Development Workshop</a>,
    },
    {
        id: 4,
        title: "Symbiosis Institute of Technology, Pune to Host SymbiTech 2025",
        content: "SymbiTech 2025, an annual tech festival, set to take place in 2025 with activities like coding, hackathons, workshops on AI, blockchain.",
        component: <a href="/symbitech-event">SymbiTech 2025 Event</a>,
    }
];

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredArticles, setFilteredArticles] = useState([]);

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() !== '') {
            const results = articles.filter(article =>
                article.title.toLowerCase().includes(query.toLowerCase()) ||
                article.content.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredArticles(results);
        } else {
            setFilteredArticles([]);
        }
    };

    return (
        <header>
            <div className='logo'>
                <img src={logo} alt="College Logo" style={{ width: '140px', height: '60px', paddingLeft: '40px' }} />
            </div>
            <nav>
                <ul className='nav'>
                    <li><a href="/" className='link'>Home</a></li>
                    <li><a href="/news" className='link'>News</a></li>
                    <li><a href="/events" className='link'>Events</a></li>
                    <li><a href="/brochure" className='link'>Info-Brochure</a></li>
                </ul>
            </nav>
            <div className='search-bar'>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Search articles..."
                    className='search-input'
                />
                {filteredArticles.length > 0 && (
                    <div className="search-results">
                        <ul>
                            {filteredArticles.map(article => (
                                <li key={article.id} className="result-link">
                                    {article.component}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

