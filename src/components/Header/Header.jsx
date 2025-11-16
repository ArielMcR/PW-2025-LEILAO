import React, { useState } from 'react'
import './Header.css'
import logo from '../../assets/imgs/logo-branca.png'
import { MagnifyingGlass, UserCircle, UserCircleGear, Star, List, X } from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router'
import Swal from 'sweetalert2'

export default function Header() {
    const { user, logout } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchFocused, setSearchFocused] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [closeTimeout, setCloseTimeout] = useState(null)

    const handleLogout = () => {
        Swal.fire({
            title: 'Sair da conta',
            text: 'Tem certeza que deseja sair?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sair',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                logout()
                setMobileMenuOpen(false)
            }
        })
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    const handleMouseEnter = () => {
        if (closeTimeout) {
            clearTimeout(closeTimeout)
            setCloseTimeout(null)
        }
        setDropdownOpen(true)
    }

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setDropdownOpen(false)
        }, 300)
        setCloseTimeout(timeout)
    }

    React.useEffect(() => {
        return () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout)
            }
        }
    }, [closeTimeout])

    return (
        <>
            <header className="modern-header">
                <div className="header-container">
                    {/* Logo */}
                    <Link to="/" className="logo-container">
                        <img src={logo} alt="Logo Leiloeiro" className='img-logo-marca' />
                    </Link>

                    {/* Navigation Desktop */}
                    <nav className="nav-desktop">
                        <Link to="/about" className='nav-link'>Quem Somos</Link>
                        <Link to="/services" className='nav-link'>Serviços</Link>
                        <Link to="/contact" className='nav-link'>Fale conosco</Link>
                    </nav>

                    {/* Search Bar */}
                    <div className={`search-container ${searchFocused ? 'focused' : ''}`}>

                        <input
                            type="text"
                            placeholder="Buscar veículos..."
                            className="search-input"
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                    </div>

                    {/* Actions Desktop */}
                    <div className="header-actions">
                        <Link to='/favorites' className='action-btn' title="Favoritos">
                            <Star size={24} weight="regular" />
                            <span>Favoritos</span>
                        </Link>

                        {user ? (
                            <div
                                className='user-dropdown'
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="user-button">
                                    <UserCircleGear size={28} weight="duotone" />
                                    <span className="user-name">{user.name}</span>
                                </button>

                                <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                                    <Link to='/my-auctions' className='dropdown-item'>
                                        <UserCircle size={18} />
                                        <span>Meus Lances</span>
                                    </Link>

                                    <button onClick={handleLogout} className='dropdown-item logout-btn'>
                                        <span>Sair</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to='/login' className='login-btn'>
                                <UserCircle size={24} weight="duotone" />
                                <span>Entrar</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                        {mobileMenuOpen ? <X size={28} weight="bold" /> : <List size={28} weight="bold" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-search">
                        <MagnifyingGlass size={20} className="search-icon" weight="regular" />
                        <input
                            type="text"
                            placeholder="Buscar veículos..."
                            className="search-input"
                        />
                    </div>

                    <nav className="mobile-nav">
                        <Link to="/about" className='mobile-nav-link' onClick={() => setMobileMenuOpen(false)}>
                            Quem Somos
                        </Link>
                        <Link to="/services" className='mobile-nav-link' onClick={() => setMobileMenuOpen(false)}>
                            Serviços
                        </Link>
                        <Link to="/contact" className='mobile-nav-link' onClick={() => setMobileMenuOpen(false)}>
                            Fale conosco
                        </Link>
                        <Link to="/favorites" className='mobile-nav-link' onClick={() => setMobileMenuOpen(false)}>
                            <Star size={20} weight="regular" />
                            Favoritos
                        </Link>

                        {user && (
                            <>
                                <div className="mobile-divider"></div>
                                <Link to="/user" className='mobile-nav-link' onClick={() => setMobileMenuOpen(false)}>
                                    Minha conta
                                </Link>
                                <Link to="/admin/Categories" className='mobile-nav-link' onClick={() => setMobileMenuOpen(false)}>
                                    Categorias
                                </Link>
                                <Link to="/admin/Feedback" className='mobile-nav-link' onClick={() => setMobileMenuOpen(false)}>
                                    Feedback
                                </Link>
                                <button onClick={handleLogout} className='mobile-nav-link logout-mobile'>
                                    Sair
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

        </>
    )
}
