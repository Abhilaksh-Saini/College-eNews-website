import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import FeaturedNews from './components/FeaturedNews';
import LatestNews from './components/LatestNews';
import Events from './components/Events';
import Footer from './components/Footer';
import About from './components/About';
import Contact from './components/Contact';
import Brochure from './components/Brochure';
import Gallery from './components/Gallery';
import Semester from './components/News1';
import FS from './components/FullStack';
import Symbitech from './components/SymbiTech';
import ExamTimetable from './components/EndSemDetails';
import './App.css';

const NewsPage = () => (
    <div>
        <section class="n2"><Semester /></section>
        <section class="n2"><ExamTimetable /></section>
    </div>
);

const EventsPage = () =>(
    <div>
        <section class="n1"><FS /></section>
        <section class="n1"><Symbitech /></section>
    </div>
)

const App = () => {
    return (
        <Router>
            <div className="App">
                <Header />
                
                <main className="container">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <br></br><FeaturedNews />
                                <br></br><LatestNews />
                                <br></br><Events />
                                <br></br><Gallery/><br></br>
                            </>
                        } />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/brochure" element={<Brochure />} />
                        <Route path="/news1" element={<Semester />} />
                        <Route path="/fullstack-event" element={<FS />} />
                        <Route path='/symbitech-event' element={<Symbitech />}/>
                        <Route path='/end-sem-news' element={<ExamTimetable />}/>
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/events" element={<EventsPage />} />
                    </Routes>   
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;

