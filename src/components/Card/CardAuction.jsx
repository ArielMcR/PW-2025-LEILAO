import React from 'react';
import './CardAuction.css';
import { NavLink } from 'react-router';
import { Carousel } from 'primereact/carousel';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

export default function CardAuction({
    id = "",
    name = "",
    imgs = [],
    mark = "",
    currentBid = "",
    traction = "",
    year = "",
    kilometers = "",
    bidEndTime = "",
    disableSlideImgs = false,
}) {
    const carouselTemplate = (url) => (
        <div>
            <img src={`${url}`} alt="Car Slide" className="card-img" />
        </div>
    );

    const carouselSettings = {
        numVisible: 1,
        numScroll: 1,
        circular: true,
        autoplayInterval: 5000,
        showNavigators: false,
        showIndicators: false,
    };

    return (
        <div className="card-cars">
            {!disableSlideImgs && imgs.length > 0 ? (
                <Carousel
                    value={imgs}
                    itemTemplate={carouselTemplate}
                    {...carouselSettings}
                />
            ) : (
                <img
                    src={`${imgs[0] || ''}`}
                    alt="First Slide"
                    className="card-img"
                />
            )}

            <div className="txt-card-cars">
                <h1 className="title-card-cars">{mark} {name}</h1>
                <p className="price-card-cars"><span>Lance Atual: </span>{currentBid}</p>
                <p className="brand-card-cars"><span>Marca: </span>{mark}</p>
                <p className="tracao-card-cars"><span>Tração: </span>{traction}</p>
                <p className="year-card-cars"><span>Ano: </span>{year}</p>
                <p className="km-card-cars"><span>KM: </span>{kilometers}</p>
                <p className="bid-end-card-cars"><span>Fim do Leilão: </span>{bidEndTime}</p>
                <div className="flex">
                    <button className="botao-card-cars">Fazer Lance</button>
                </div>
            </div>
        </div>
    );
}