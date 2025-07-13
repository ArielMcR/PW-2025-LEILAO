import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import slide1 from '../../../assets/imgs/slide1.png';
import slide2 from '../../../assets/imgs/slide2.png';
import './Home.css';
function Home() {
    const [images, setImages] = useState([{
        url: slide1,
        alt: 'Leilão de Carros - slide 1',
    }, {
        url: slide2,
        alt: 'Leilão de Carros - slide 2',
    }]);

    const itemTemplate = (item) => {
        return <img src={item.url} alt={item.alt} style={{ width: '100%', display: 'block', objectFit: 'contain' }} />;
    }

    const thumbnailTemplate = (item) => {
        return <img src={item.url} alt={item.alt} style={{ width: '100%', display: 'block' }} />;
    }

    return (
        <>
            <Header />
            <Galleria value={images}
                style={{ width: '100%' }}
                showItemNavigators showItemNavigatorsOnHover
                showThumbnails={false} item={itemTemplate} thumbnail={thumbnailTemplate} autoPlay transitionInterval={2000} />
            <div style={{ height: "100vh" }}>

            </div>
            <Footer />
        </>
    )
}

export default Home