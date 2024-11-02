// import React from 'react';
// import Header from './components/Header';
// import FeaturedNews from './components/FeaturedNews';
// import LatestNews from './components/LatestNews';
// import Events from './components/Events';
// import Footer from './components/Footer';


// const App = () => { 
//     return (
//         <div className="App">
//             <Header />
//             <main className="container">
//                 <FeaturedNews />
//                 <LatestNews />
//                 <Events />
//             </main>
//             <Footer />
//         </div>
//     );
// };

// export default App;

// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import FeaturedNews from './components/FeaturedNews';
import LatestNews from './components/LatestNews';
import Events from './components/Events';
import Footer from './components/Footer';
import About from './components/About';
import Contact from './components/Contact';

const App = () => { 
    return (
        <Router>
            <div className="App">
                <Header />
                <main className="container">
                    <Routes>
                        <Route path="/" element={
                            <>
                                <FeaturedNews />
                                <LatestNews />
                                <Events />
                            </>
                        } />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;

