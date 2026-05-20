/*
  Costruisci un form di iscrizione con email e password, con stato iniziale, tocuhed, messaggi di errori,
  validazione campi e handle su onChange. Valida l'indirizzo email e password che deve essere di almeno 8 caratteri
  e con un lettera minuscola, maiuscola, un numero e un simbolo. Il pulsante invia deve essere attivato se l'utente
  è entrato almeno una volta su tutti i campi obbligatori e questi ultimi sono stati compilati. Non aggiungere chiamate API,
  routing o salvataggi esterni. Usa nomi coerenti per valori, errori e touched.
  Per ogni campo ricordati di mettere l'eventuale messaggio di errore in una posizione coerente con il campo,
  ben chiaro e poco tecnico.

  Aggiungi due nuovi campi per la conferma della password (che deve rispettare gli stessi vincoli della password e deve essere
  identica alla prima password) e dell'accettazione dei Termini D'uso e della Normativa sulla privacy (radio "accetto" e "non accetto"
  in cui è obbligatorio accettare). Mantieni le stesse regole indicate per la prima consegna su stato iniziale, touched,
  messaggi di errore, validazione e handler.
*/

import './App.css'
import Form from './components/Form'
import type { FieldConfig } from './components/Form'

function App() {
  const formFields: FieldConfig[] = [
    {
      name: 'Email',
      label: 'Email',
      type: 'email',
      placeholder: 'Inserisci la tua email'
    },
    {
      name: 'Password',
      label: 'Password',
      type: 'password',
      placeholder: 'Crea una password sicura'
    },
    {
      name: 'Conferma password',
      label: 'Conferma password',
      type: 'password',
      placeholder: 'Ripeti la password'
    },
    {
      name: 'Termini e Condizioni',
      label: 'Termini e Condizioni',
      type: 'radio',
      options: [
        { label: 'Accetto', value: 'accetto' },
        { label: 'Non accetto', value: 'non accetto' }
      ]
    }
  ];

  const handleSubmit = (values: Record<string, string>) => {
    alert("Registrazione completata con successo!");
    console.log("Submit del form avvenuto con successo! Dati ricevuti nel parent:", values);
  };

  const handleChange = (field: string, value: string, allValues: Record<string, string>) => {
    console.log(`[Parent onChange] Il campo ${field} è cambiato a: "${value}"`, allValues);
  };

  const handleBlur = (field: string, value: string, allValues: Record<string, string>) => {
    console.log(`[Parent onBlur] Focus perso sul campo ${field} con valore: "${value}"`, allValues);
  };

  const handleFocus = (field: string, value: string, allValues: Record<string, string>) => {
    console.log(`[Parent onFocus] Focus ottenuto sul campo ${field} con valore corrente: "${value}"`, allValues);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <Form
        title="Registrazione"
        fields={formFields}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
      />
    </div>
  );
}

export default App
