import React from 'react'
import { Card } from 'primereact/card';
import './CardTypes.css';
function CardTypes({
    icon,
    title = "Leilão de Carros",
}) {
    return (
        <Card className="card-type" >
            <div className="card-type-content">
                <h3 className="card-type-title">{title}</h3>
                {icon}
            </div>
        </Card>
    )
}

export default CardTypes