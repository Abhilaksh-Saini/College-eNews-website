import React from 'react';
import Header from './components/Header';
import FeaturedNews from './components/FeaturedNews';
import LatestNews from './components/LatestNews';
import Events from './components/Events';
import Footer from './components/Footer';


const App = () => { 
    return (
        <div className="App">
            <Header />
            <main className="container">
                <FeaturedNews />
                <LatestNews />
                <Events />
            </main>
            <Footer />
        </div>
    );
};

export default App;
