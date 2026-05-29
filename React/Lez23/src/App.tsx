/*
  Crea un progetto con login, registrazione, pagina pubblica e pagina privata, dove l'utente può accedere
  in qualsiasi momento alla prima, se non è loggato alla seconda e alla terza e se è loggato all'ultima.
  Utilizza JSON-server-auth per il mock del back-end, React Router per la gestione delle rotte e il Local Storage per
  il salvataggio del token di accesso. Crea anche una barra di navigazione con le quattro voci per andare verso ognuna
  delle quattro pagine più un pulsante per effettuare il logout (visibile solo se l'utente è loggato).
  Se l'utente sta tendando di entrare nella pagina protetta senza token rimandalo al login e se l'utente sta tentando di
  entrare nelle pagine di login e registrazione quando è già loggato rimandalo alla pagina protetta.
  Utilizza sempre gli stati dell'UI per far capire all'utente che cosa sta succedendo con messaggi chiari per operazioni riuscite,
  fallite e caricamenti in corso. Il logout deve solo cancellare il token e rimandare l'utente al login.

  Mantieni separati UI, servizi, tipizzazioni, helpers (ad esempio quello per il salvataggio e recupero delle informazioni
  nel local storage) e configurazioni, usando sempre nomi chiari per variabili, funzioni e classi che spieghino che
  cosa fanno senza dover leggere tutto il codice.
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
