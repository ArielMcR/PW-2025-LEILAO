import React from 'react';
import './Footer.css';
import { Link } from 'react-router';

export default function Footer() {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-links">
                    <Link to='/' className='links'>
                        <span>HOME</span>  |
                    </Link>
                    <Link to='/estoque' className='links'>
                        <span>ESTOQUE</span>  |
                    </Link>
                    <Link to='/contato' className='links'>
                        <span>CONTATO</span>
                    </Link>
                </div>
                <div className="footer-address">
                    <p>Paranavaí, Paraná</p>
                </div>
                <div className="footer-copyright">
                    <p>Copyright <b>Leiloeiro</b> cnpj: 00.000.000/0000-00 <b>&copy;2025</b>, sistema licenciado por Onixx Hub</p>
                </div>
            </div>
        </footer>
    );
}