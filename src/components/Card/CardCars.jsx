import React from 'react';
import './CardCars.css';
import { NavLink } from 'react-router';
import Slider from 'react-slick';
export default function Card(
    {
        id = "",
        name = "",
        imgs = "",
        mark = "",
        price = "",
        traction = "",
        year = "",
        kilometers = "",
        disableSlideImgs = false,
    }
) {
    const settings = {
        infinite: true,
        speed: 1200,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 5000,
    };
    return (
        <>
            <NavLink to={`/carros/${id}`} className="card-cars">
                {!disableSlideImgs ? (
                    <Slider {...settings}>
                        {imgs.map((url, index) => (
                            <div key={index}>
                                <img
                                    src={`${url}`}
                                    alt={`Slide ${index + 1}`}
                                    className="card-img"
                                />
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <img
                        src={`${imgs[0]}`}
                        alt="First Slide"
                        className="card-img"
                    />
                )}

                <div className="txt-card-cars">
                    <h1 className="titulo-card-cars">{mark} {name}</h1>
                    <p className="valor-card-cars"><span>Preço: </span>{price}</p>
                    <p className="marca-card-cars"><span>Marca: </span>{mark}</p>
                    <p className="tracao-card-cars"><span>Tração: </span>{traction}</p>
                    <p className="ano-card-cars"><span>Ano: </span>{year}</p>
                    <p className="km-card-cars"><span>KM: </span>{kilometers}</p>
                    <div className="flex">
                        <button to={`/carros/${id}`} className="botao-card-cars">Ver Detalhes</button>
                    </div>
                </div>
            </NavLink>
        </>
    )
}