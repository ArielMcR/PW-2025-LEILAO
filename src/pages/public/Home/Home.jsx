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
import { Search, Gavel, ArrowRight } from 'lucide-react';
import { useAllCars } from '../../../hooks/useAllCar';
import CardAuction from '../../../components/Card/CardAuction';
import { NavLink } from 'react-router';
function Home() {
    const { vehicles, isLoading } = useAllCars();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
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

            {/* Hero Section */}
            <section className="hero-section">
                <Galleria value={images}
                    style={{ width: '100%' }}
                    showItemNavigators showItemNavigatorsOnHover
                    showThumbnails={false} item={itemTemplate} thumbnail={thumbnailTemplate} autoPlay transitionInterval={3000} />
            </section>

            {/* Main Content */}
            <div className="home-container">

                {/* Search Section */}
                <section className="search-section">
                    <h2 className="section-title">Buscar Leilões</h2>
                    <div className="search-filters">
                        <Dropdown
                            variant="filled"
                            value={selectState}
                            onChange={(e) => setSelectState(e.value)}
                            options={state}
                            optionLabel="name"
                            placeholder="Estado"
                            className="search-dropdown"
                        />
                        <Dropdown
                            variant="filled"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.value)}
                            options={[
                                { name: 'Carros', code: 'CAR' },
                                { name: 'Caminhões', code: 'TRUCK' },
                                { name: 'Motos', code: 'BIKE' }
                            ]}
                            optionLabel="name"
                            placeholder="Categoria"
                            className="search-dropdown"
                        />
                        <div className="search-input-wrapper">
                            <InputText
                                placeholder="Buscar por título..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-text-input"
                            />
                        </div>
                        <Button
                            label="Buscar"
                            icon={<Search size={18} />}
                            className="search-btn"
                        />
                    </div>
                </section>

                {/* Auctions Section */}
                <section className="auctions-section">
                    <h2 className="section-title">
                        <Gavel size={28} />
                        Leilões em Destaque
                    </h2>

                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Carregando leilões...</p>
                        </div>
                    ) : vehicles && vehicles.length > 0 ? (
                        <>
                            <div className="cards-container">
                                {vehicles.slice(0, 6).map(vehicle => (
                                    <CardAuction key={vehicle.idAuction || vehicle.id} {...vehicle} />
                                ))}
                            </div>
                            {vehicles.length > 6 && (
                                <div className="see-more-wrapper">
                                    <NavLink to="/cars" className="see-more-link">
                                        Ver Todos os Leilões
                                        <ArrowRight size={20} />
                                    </NavLink>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <Gavel size={64} />
                            <h3>Nenhum leilão disponível</h3>
                            <p>Novos leilões em breve!</p>
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </>
    )
}

export default Home