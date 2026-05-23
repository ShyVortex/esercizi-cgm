/*
  Inizia a creare in React un CRUD di un gestionale degli utenti con campi id, username, email, isActive,
  firstName, lastName e middleName (quest'ultimo facoltativo) con la pagina della lista paginata degli utenti,
  la possibilità di vedere il dettaglio di un singolo utente e la possibilità di creare un nuovo utente, facendo
  in modo che isActive venga sempre inviato a true e che middleName venga inviato solo se compilato.
  Usa sempre gli stati dell'UI (loading, empty state, error e success) e separa tutta la logica in componenti,
  service, helpers, type, ecc... mantenendo chiari nomi di variabili, funzioni e componenti in modo che solo
  leggendo quello sia possibilità capire che cosa fa quell'elemento ed evitando duplicazioni di codice.
  Aggiungi nella lista un filtro per visualizzare solo gli utenti che sono attivi, non attivi oppure tutti.
*/

import UserPage from './pages/UserPage.tsx';


function App() {
  return (
    <>
      <UserPage />
    </>
  )
}

export default App
