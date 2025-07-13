import React, { useState, useEffect } from 'react';
import { Galleria } from 'primereact/galleria';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import slide1 from '../../../assets/imgs/slide1.png';
import slide2 from '../../../assets/imgs/slide2.png';
import './Home.css';
import CardTypes from '../../../components/CardTypes/CardTypes';
import { Car } from 'lucide-react';
import { Truck } from 'lucide-react';
import { Bike } from 'lucide-react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Search } from 'lucide-react';
import { useAllCars } from '../../../hooks/useAllCar';
import CardAuction from '../../../components/Card/CardAuction';
import { NavLink } from 'react-router';
function Home() {
    const { vehicles, isLoading } = useAllCars();
    const [images, setImages] = useState([{
        url: slide1,
        alt: 'Leilão de Carros - slide 1',
    }, {
        url: slide2,
        alt: 'Leilão de Carros - slide 2',
    }]);
    const [selectState, setSelectState] = useState(null);
    const state = [
        { name: 'São Paulo', code: 'SP' },
        { name: 'Rio de Janeiro', code: 'RJ' },
        { name: 'Minas Gerais', code: 'MG' },
        { name: 'Bahia', code: 'BA' },
        { name: 'Paraná', code: 'PR' },
        { name: 'Santa Catarina', code: 'SC' },
        { name: 'Rio Grande do Sul', code: 'RS' },
        { name: 'Distrito Federal', code: 'DF' },
    ]

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
            <div style={{ height: 'auto' }}>
                <div className="cards-type-list">
                    <CardTypes icon={<Car />} title="Carros" />
                    <CardTypes icon={<Truck />} title="Caminhões" />
                    <CardTypes icon={<Car />} title="Camionetas" />
                    <CardTypes icon={<Bike />} title="Moto" />
                </div>
                <section className="search">
                    <Dropdown variant="filled" value={selectState} onChange={(e) => setSelectState(e.value)} options={state} optionLabel="name"
                        placeholder="Selecione a cidade" className="w-full md:w-10rem dropdown-city" />
                    <Dropdown variant="filled" value={selectState} onChange={(e) => setSelectState(e.value)} options={state} optionLabel="name"
                        placeholder="Selecione a cidade" className="w-full md:w-10rem dropdown-city" />
                    <div className="p-inputgroup w-full md:w-14rem">
                        <InputText placeholder="Pesquisar..." className='w-full md:w-14rem h-2rem' />
                        <Button icon={<Search color='white' size={20} />} className="p-button-warning search-input" />
                    </div>
                    <Button label="Buscar" className="p-button-primary search-button" />
                </section>
                <section className="then-cars">

                    {isLoading ? (
                        <div className="loading">Carregando...</div>
                    ) : (
                        <div className="cards-container">
                            {vehicles.map(vehicle => (
                                <CardAuction key={vehicle.id} {...vehicle} />
                            ))}
                        </div>
                    )}
                    <div className="see-more-content">
                        <NavLink to="/cars" className="p-button-secondary see-more">Ver Mais</NavLink>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    )
}

export default Home