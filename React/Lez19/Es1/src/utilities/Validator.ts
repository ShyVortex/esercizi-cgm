export abstract class Validator {
    // Funzione di validazione dei singoli campi
    public static validateFields(fieldName: string, value: string, allValues: Record<string, string>): string {
        const trimmed = value.trim();
        if (!trimmed) {
            return "Questo campo è obbligatorio.";
        }

        const lowerName = fieldName.toLowerCase();

        // Validazione Email
        if (lowerName.includes("email")) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmed)) {
                return "Inserisci un indirizzo email valido (es. nome@esempio.com).";
            }
        }

        // Validazione Password
        if (lowerName === "password") {
            if (trimmed.length < 8) {
                return "La password deve contenere almeno 8 caratteri.";
            }
            if (!/[a-z]/.test(trimmed)) {
                return "La password deve contenere almeno una lettera minuscola.";
            }
            if (!/[A-Z]/.test(trimmed)) {
                return "La password deve contenere almeno una lettera maiuscola.";
            }
            if (!/\d/.test(trimmed)) {
                return "La password deve contenere almeno un numero.";
            }
            if (!/[!@#$%^&*(),.?":{}|<>+]/.test(trimmed)) {
                return "La password deve contenere almeno un simbolo speciale (es. !, @, #, +, etc.).";
            }
        }

        // Validazione Conferma Password
        if (lowerName.includes("conferma") || lowerName.includes("confirm")) {
            const pwdKey = Object.keys(allValues).find(k => k.toLowerCase() === "password");
            if (pwdKey && trimmed !== allValues[pwdKey]) {
                return "Le password non coincidono.";
            }
        }

        // Validazione Termini d'uso
        if (lowerName.includes("termini") || lowerName.includes("privacy") || lowerName.includes("accetto")) {
            if (trimmed !== "accetto") {
                return "Devi accettare i Termini e Condizioni per continuare.";
            }
        }

        return "";
    }
}