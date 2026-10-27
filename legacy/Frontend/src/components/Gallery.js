import React, { useState } from 'react';
import '../Css/Gallery.css';
const ImageSlider = () => {
  const images = [
    'https://www.sitpune.edu.in/assets/images/student/gallery/sit-campus-1.jpg',
    'https://www.sitpune.edu.in/assets/images/student/img-3.jpg',
    'https://www.sitpune.edu.in/assets/images/student/image6.jpg',
    'https://www.sitpune.edu.in/assets/images/student/gallery/life-at-sit-1.jpg',
    'https://www.sitpune.edu.in/assets/images/student/gallery/sports-at-sit-2.jpg'
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleSwipeRight = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div class="Gallery" style={{ textAlign: 'center' }  }>
        <h1 class="h1">Gallery</h1>
      <img class="img" src={images[currentIndex]} alt="Slider" style={{ width: '600px', height: '400px' }} />
      <div style={{paddingTop:'5px'}}>
        <button onClick={handleSwipeLeft}><strong>{'<'}</strong></button>
        <button onClick={handleSwipeRight}><strong>{'>'}</strong></button>
      </div>
    </div>
  );
};

export default ImageSlider;
