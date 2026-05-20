import { useState } from "react";
import { Validator } from "../utilities/Validator";

export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "password" | "radio" | "email";
    placeholder?: string;
    required?: boolean; // Se obbligatorio (default true)
    options?: { label: string; value: string }[]; // Opzioni per i radio button
    validate?: (value: string, allValues: Record<string, string>) => string; // Validazione custom
}

type Props = {
    title: string;
    fields: FieldConfig[];
    onSubmit: (values: Record<string, string>) => void;
    onChange?: (field: string, value: string, allValues: Record<string, string>) => void;
    onBlur?: (field: string, value: string, allValues: Record<string, string>) => void;
    onFocus?: (field: string, value: string, allValues: Record<string, string>) => void;
}

export default function Form({ title, fields, onSubmit, onChange, onBlur, onFocus }: Props): React.ReactElement {
    // Stato dei valori inseriti negli input
    const [values, setValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        fields.forEach(f => {
            initial[f.name] = "";
        });
        return initial;
    });

    // Stato per tracciare se un campo è stato visitato (touched)
    const [touched, setTouched] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        fields.forEach(f => {
            initial[f.name] = false;
        });
        return initial;
    });

    // Stato per contenere i messaggi di errore di validazione
    const [errors, setErrors] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        fields.forEach(f => {
            initial[f.name] = "";
        });
        return initial;
    });

    // Stato per tracciare la visibilità di ciascun campo password
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

    // Stato per controllare se mostrare o meno gli errori
    const [showErrors, setShowErrors] = useState<boolean>(false);

    const togglePasswordVisibility = (field: string) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Funzione helper per validare un singolo campo usando la regola custom se presente
    const validateField = (field: FieldConfig, value: string, allValues: Record<string, string>): string => {
        if (field.validate) {
            return field.validate(value, allValues);
        }
        return Validator.validateFields(field.name, value, allValues);
    };

    // Calcola gli errori di tutti i campi
    const getFormErrors = (allValues: Record<string, string>): Record<string, string> => {
        const currentErrors: Record<string, string> = {};
        fields.forEach(f => {
            currentErrors[f.name] = validateField(f, allValues[f.name] || "", allValues);
        });
        return currentErrors;
    };

    // Gestione della modifica dell'input (onChange)
    const handleChange = (fieldName: string, val: string) => {
        const nextValues = { ...values, [fieldName]: val };
        setValues(nextValues);

        setTouched(prev => ({ ...prev, [fieldName]: true }));

        // Se stiamo già mostrando gli errori, valida in tempo reale
        if (showErrors) {
            const fieldConfig = fields.find(f => f.name === fieldName)!;
            const err = validateField(fieldConfig, val, nextValues);
            setErrors(prev => ({ ...prev, [fieldName]: err }));
        }

        if (onChange) {
            onChange(fieldName, val, nextValues);
        }
    };

    // Gestione del focus out (onBlur)
    const handleBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));

        // Se stiamo già mostrando gli errori, valida in tempo reale
        if (showErrors) {
            const fieldConfig = fields.find(f => f.name === fieldName)!;
            const err = validateField(fieldConfig, values[fieldName], values);
            setErrors(prev => ({ ...prev, [fieldName]: err }));
        }

        if (onBlur) {
            onBlur(fieldName, values[fieldName], values);
        }
    };

    // Gestione del focus in (onFocus)
    const handleFocus = (fieldName: string) => {
        if (onFocus) {
            onFocus(fieldName, values[fieldName], values);
        }
    };

    // Verifica se tutti i campi obbligatori sono stati visitati e compilati (non vuoti)
    const isFormFilled = fields.every(f => {
        const isFieldRequired = f.required !== false;
        const val = values[f.name] || "";
        const isTouched = touched[f.name];
        if (isFieldRequired) {
            return isTouched && val.trim() !== "";
        }
        return true;
    });

    // Calcola se ci sono errori attivi nel form
    const currentErrors = getFormErrors(values);
    const hasAnyError = Object.values(currentErrors).some(err => err !== "");

    // Il pulsante si attiva:
    // - Se showErrors è false: quando tutti i campi sono compilati (indipendentemente dalla validità)
    // - Se showErrors è true: quando tutti gli errori sono stati corretti
    const isButtonActive = showErrors ? !hasAnyError : isFormFilled;

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();

        // Forza la validazione di tutti i campi al submit
        const allErrors = getFormErrors(values);
        const hasErrors = Object.values(allErrors).some(err => err !== "");

        if (hasErrors) {
            setErrors(allErrors);
            setShowErrors(true);
        } else {
            onSubmit(values);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 text-left border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-100 text-left">{title}</h2>

                {fields.map(field => {
                    const isPassword = field.type === "password";
                    const isTerms = field.type === "radio";
                    const options = field.options || [
                        { label: "Accetto", value: "accetto" },
                        { label: "Non accetto", value: "non accetto" }
                    ];

                    return (
                        <div key={field.name} className="mt-6">
                            <div className="mb-5 flex flex-col">
                                <label className="text-sm font-semibold text-gray-300 mb-1 text-left">{field.label}</label>

                                {isTerms ? (
                                    <div className="flex gap-6 mt-1">
                                        {options.map(opt => (
                                            <label key={opt.value} className="inline-flex items-center text-sm text-gray-300 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={field.name}
                                                    value={opt.value}
                                                    checked={values[field.name] === opt.value}
                                                    onChange={() => handleChange(field.name, opt.value)}
                                                    onBlur={() => handleBlur(field.name)}
                                                    onFocus={() => handleFocus(field.name)}
                                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700"
                                                />
                                                {opt.label}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative w-full">
                                        <input
                                            type={isPassword ? (showPassword[field.name] ? "text" : "password") : field.type}
                                            value={values[field.name]}
                                            placeholder={field.placeholder}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            onBlur={() => handleBlur(field.name)}
                                            onFocus={() => handleFocus(field.name)}
                                            className={`w-full pl-3 ${isPassword ? 'pr-10' : 'pr-3'} py-2 border rounded bg-gray-700 text-white outline-none transition-colors ${showErrors && errors[field.name]
                                                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                                                : "border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                }`}
                                        />
                                        {isPassword && touched[field.name] && (
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility(field.name)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 cursor-pointer"
                                            >
                                                {!showPassword[field.name] ? (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Mostra il messaggio di errore solo se abilitato (dopo il submit fallito) ed è presente un errore */}
                                {showErrors && errors[field.name] && (
                                    <p className="text-red-400 text-xs mt-1.5 font-medium text-left">
                                        {errors[field.name]}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                <button
                    type="submit"
                    disabled={!isButtonActive}
                    className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded font-semibold transition-all cursor-pointer hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">
                    Conferma
                </button>
            </form>
        </div>
    );
}