import { useState } from "react";
import { Validator } from "../utilities/Validator";

type Props = {
    title: string;
    fields: string[];
}

export default function Form({ title, fields }: Props): React.ReactElement {
    // Stato dei valori inseriti negli input
    const [values, setValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        fields.forEach(f => {
            initial[f] = "";
        });
        return initial;
    });

    // Stato per tracciare se un campo è stato visitato (touched)
    const [touched, setTouched] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        fields.forEach(f => {
            initial[f] = false;
        });
        return initial;
    });

    // Stato per contenere i messaggi di errore di validazione
    const [errors, setErrors] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        fields.forEach(f => {
            initial[f] = "";
        });
        return initial;
    });

    // Gestione della modifica dell'input (onChange)
    const handleChange = (field: string, val: string) => {
        const nextValues = { ...values, [field]: val };
        setValues(nextValues);

        // Considera il campo come "touched" appena l'utente inizia a scrivere o interagire
        setTouched(prev => ({ ...prev, [field]: true }));

        // Aggiorna l'errore in tempo reale
        const err = Validator.validateFields(field, val, nextValues);
        setErrors(prev => ({ ...prev, [field]: err }));
    };

    // Gestione del focus out (onBlur)
    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const err = Validator.validateFields(field, values[field], values);
        setErrors(prev => ({ ...prev, [field]: err }));
    };

    // Verifica la validità complessiva del form
    // Attivato solo se: tutti i campi sono stati visitati, non sono vuoti e non contengono errori
    const isFormValid = fields.every(field => {
        const val = values[field];
        const isTouched = touched[field];
        const isNotEmpty = val.trim() !== "";
        const hasNoError = errors[field] === "" && Validator.validateFields(field, val, values) === "";
        return isTouched && isNotEmpty && hasNoError;
    });

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (isFormValid) {
            alert("Registrazione completata con successo!");
            console.log("Dati inviati:", values);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 text-left border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-100 text-left">{title}</h2>

                {fields.map(field => {
                    const isPassword = field.toLowerCase().includes("password");
                    const isTerms = field.toLowerCase().includes("termini") || field.toLowerCase().includes("privacy");

                    return (
                        <div key={field} className="mt-6">
                            <div className="mb-5 flex flex-col">
                                <label className="text-sm font-semibold text-gray-300 mb-1 text-left">{field}</label>

                                {isTerms ? (
                                    <div className="flex gap-6 mt-1">
                                        <label className="inline-flex items-center text-sm text-gray-300 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={field}
                                                value="accetto"
                                                checked={values[field] === "accetto"}
                                                onChange={() => handleChange(field, "accetto")}
                                                onBlur={() => handleBlur(field)}
                                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700"
                                            />
                                            Accetto
                                        </label>
                                        <label className="inline-flex items-center text-sm text-gray-300 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={field}
                                                value="non accetto"
                                                checked={values[field] === "non accetto"}
                                                onChange={() => handleChange(field, "non accetto")}
                                                onBlur={() => handleBlur(field)}
                                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700"
                                            />
                                            Non accetto
                                        </label>
                                    </div>
                                ) : (
                                    <input
                                        type={isPassword ? "password" : "text"}
                                        value={values[field]}
                                        onChange={(e) => handleChange(field, e.target.value)}
                                        onBlur={() => handleBlur(field)}
                                        className={`w-full px-3 py-2 border rounded bg-gray-700 text-white outline-none transition-colors ${touched[field] && errors[field]
                                            ? "border-red-500 focus:ring-2 focus:ring-red-500"
                                            : "border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            }`}
                                    />
                                )}

                                {/* Mostra il messaggio di errore solo se l'utente ha interagito ed è presente un errore */}
                                {touched[field] && errors[field] && (
                                    <p className="text-red-400 text-xs mt-1.5 font-medium text-left">
                                        {errors[field]}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded font-semibold transition-all hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">
                    Conferma
                </button>
            </form>
        </div>
    );
}