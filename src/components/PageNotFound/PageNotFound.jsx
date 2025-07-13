import React from 'react';
import './PageNotFound.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import pagenotfound from '../../assets/imgs/404.png';
import { NavLink } from 'react-router';
import { House } from '@phosphor-icons/react';
export default function PageNotFound() {

    return (
        <>
            {/* <Header /> */}
            <div className="page-not-found" style={{ position: 'relative', zIndex: 20000 }}>
                <p>Oops!</p>
                <img src={pagenotfound} alt="Page not found" />
                <h2>Parece que essa página não existe, <span> volte para tela inicial no botão abaixo</span></h2>
                <NavLink to="/home" className="btn-back">
                    <House size={40} color='white' />
                </NavLink>
            </div>
            {/* <Footer /> */}
        </>
    )

}