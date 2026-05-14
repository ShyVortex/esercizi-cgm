/*
    Creare un componente per la card di un profilo con nome, ruolo e stato (online/offile)
    che prenda i dati dal componente padre tramite props di React, usando una struttura con titolo, descrizione
    e indicatore di stato. Successivamente aggiungi l'apertura della card con ulteriori dettagli del profilo
    gestendo lo stato (booleano) aperta/chiusa tramite gli state di React.
*/

import React, { useState } from 'react';

type Props = {
    name: string,
    role: string,
    status: 'online' | 'offline',
    age: number,
    country: string,
    city: string,
    birthDate: string
}

const style: React.CSSProperties = {
    color: "white",
    backgroundColor: "black",
    padding: "10px",
    paddingBottom: "0",
    textAlign: "center",
    borderRadius: "15px"
};


export default function ProfileCard(props: Props) {
    const name: string = props.name;
    const role: string = props.role;
    const status: 'online' | 'offline' = props.status;
    const age: number = props.age;
    const country: string = props.country;
    const city: string = props.city;
    const birthDate: string = props.birthDate;

    const [isOpened, setIsOpened] = useState(false);

    return (
        <div style={style} onClick={() => setIsOpened(!isOpened)}>
            <h2><b>{name}</b></h2>
            <h3><b>{role}</b></h3>
            <h4>{status}</h4>
            {isOpened && <h5>{age.toString()}</h5>}
            {isOpened && <h5>{country}</h5>}
            {isOpened && <h5>{city}</h5>}
            {isOpened && <h5>{birthDate}</h5>}
        </div>
    );
}