/*
  Partendo dal progetto creato nella giornata precedente introduci nell'oggetto user della risposta del login
  un campo di tipo stringa "role" con il ruolo dell'utente (reader, editor e admin) e un campo permessi (permissions)
  di tipo array di stringhe che indichi quali azione l'utente può effettuare (esempio: "users-view", "user-details").
  Ogni utente non deve avere i permessi per effettuare tutte le operazioni, tutte le operazioni non permesse non devono
  essere visibili, che si tratti della visualizzazione di una pagina oppure il pulsante che fa una certa azione.
  
  Se l'utente non può vedere una certa pagina non deve poterla vedere nella barra di navigazione,
  se ci prova ad andare a mano deve poter vedere un messaggio di errore 403 (accesso negato), invece quando il token
  scade l'utente riceve un 401 deve essere rimandato alla pagina di accesso. Non risolvere tutto con role === "admin".
  Utilizza sempre nomi parlanti per classi, funzioni e variabili e segui sempre il flusso degli stati UI.
*/

import { Navigate } from "react-router-dom";
import type { User } from "./models/types/User";
import { AuthStorageService } from "./services/auth-storage.service"


function App() {
  const user: User | undefined = AuthStorageService.getUser();

  return (
    <>
      {user ? (
        <Navigate to="/private" replace />
      ) : (
        <Navigate to="/public" replace />
      )}
    </>
  );
}

export default App
