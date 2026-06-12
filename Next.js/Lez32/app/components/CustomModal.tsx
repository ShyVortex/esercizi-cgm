"use client";

import React, { useState } from "react";
import Modal from 'react-modal';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from 'sweetalert2';
import { User } from '@/models/types/User';
import { AuthStorageService } from '../services/auth-storage.service';
import { createUserAction, updateUserAction } from '../actions/user.actions';
import { useRouter } from "next/navigation";

if (typeof window !== 'undefined') {
    Modal.setAppElement('#root');
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
}

export default function CustomModal({ isOpen, onClose, user }: Props) {
    const loggedUser = AuthStorageService.getUser();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const isEdit = !!user;
 
    // Schema di validazione Yup
    const UserValidationSchema = Yup.object().shape({
        username: Yup.string()
            .min(3, "Username obbligatorio (minimo 3 caratteri).")
            .required("L'username è obbligatorio."),
        email: Yup.string()
            .email("Inserisci un indirizzo email valido.")
            .required("L'email è obbligatoria."),
        password: isEdit
            ? Yup.string().min(6, "La password deve contenere almeno 6 caratteri.").optional()
            : Yup.string().min(6, "La password deve contenere almeno 6 caratteri.").required("La password è obbligatoria."),
        firstName: Yup.string()
            .min(2, "Il nome deve contenere almeno 2 caratteri.")
            .required("Il nome è obbligatorio."),
        lastName: Yup.string()
            .min(2, "Il cognome deve contenere almeno 2 caratteri.")
            .required("Il cognome è obbligatorio."),
        middleName: Yup.string().optional(),
        role: Yup.number().required("Il ruolo è obbligatorio.")
    });
 
    const initialValues = {
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        middleName: user?.middleName || "",
        role: user?.role || 1
    };
 
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={isEdit ? "Modifica Utente" : "Crea Nuovo Utente"}
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
                <h2 className="text-lg font-semibold text-white m-0">
                    {isEdit ? 'Modifica Utente' : 'Crea Nuovo Utente'}
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white text-2xl font-bold cursor-pointer transition-colors duration-150 leading-none"
                >
                    &times;
                </button>
            </div>
 
            <Formik
                initialValues={initialValues}
                validationSchema={UserValidationSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                    const formData = new FormData();
                    if (isEdit && user) {
                        formData.append("userId", user.id);
                    }
                    formData.append("username", values.username.trim());
                    formData.append("email", values.email.trim());
                    if (values.password) {
                        formData.append("password", values.password);
                    }
                    formData.append("firstName", values.firstName.trim());
                    formData.append("lastName", values.lastName.trim());
                    if (values.middleName) {
                        formData.append("middleName", values.middleName.trim());
                    }
                    formData.append("role", String(values.role));
 
                    const actionToRun = isEdit ? updateUserAction : createUserAction;
                    try {
                        const response = await actionToRun({ success: true, message: "" }, formData);
 
                        if (response.success === false) {
                            if (response.errors) {
                                setErrors(response.errors);
                            } else {
                                Swal.fire({
                                    title: "Errore!",
                                    text: response.message || "Si è verificato un errore.",
                                    icon: "error",
                                    background: "#1f2937",
                                    color: "#fff"
                                });
                            }
                        } else {
                            Swal.fire({
                                title: "Successo!",
                                text: response.message || "Operazione completata con successo.",
                                icon: "success",
                                background: "#1f2937",
                                color: "#fff",
                                timer: 2000,
                                showConfirmButton: false
                            });
                            if (response.redirectUrl) {
                                router.push(response.redirectUrl);
                            } else {
                                onClose();
                            }
                        }
                    } catch (error) {
                        Swal.fire({
                            title: "Errore!",
                            text: error instanceof Error ? error.message : "Si è verificato un errore imprevisto.",
                            icon: "error",
                            background: "#1f2937",
                            color: "#fff"
                        });
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form className="p-6 space-y-4 text-left">
                        {/* Username */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                            <Field
                                type="text"
                                name="username"
                                disabled={isSubmitting}
                                placeholder="es. m.rossi"
                                className={`w-full bg-gray-900 border rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    errors.username && touched.username ? "border-red-500" : "border-gray-700"
                                }`}
                            />
                            <ErrorMessage name="username" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                            <Field
                                type="email"
                                name="email"
                                disabled={isSubmitting}
                                placeholder="es. marco.rossi@example.com"
                                className={`w-full bg-gray-900 border rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    errors.email && touched.email ? "border-red-500" : "border-gray-700"
                                }`}
                            />
                            <ErrorMessage name="email" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Password (solo se Admin) */}
                        {loggedUser?.role === 3 && (
                            <div className="flex flex-col gap-1">
                                <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Field
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        disabled={isSubmitting}
                                        placeholder="••••••••"
                                        className={`w-full bg-gray-900 border rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                            errors.password && touched.password ? "border-red-500" : "border-gray-700"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isSubmitting}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.956-3.956l-3.09-3.09m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <ErrorMessage name="password" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>
                        )}

                        {/* Grid per Nome e Cognome */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</label>
                                <Field
                                    type="text"
                                    name="firstName"
                                    disabled={isSubmitting}
                                    placeholder="Marco"
                                    className={`w-full bg-gray-900 border rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        errors.firstName && touched.firstName ? "border-red-500" : "border-gray-700"
                                    }`}
                                />
                                <ErrorMessage name="firstName" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cognome</label>
                                <Field
                                    type="text"
                                    name="lastName"
                                    disabled={isSubmitting}
                                    placeholder="Rossi"
                                    className={`w-full bg-gray-900 border rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        errors.lastName && touched.lastName ? "border-red-500" : "border-gray-700"
                                    }`}
                                />
                                <ErrorMessage name="lastName" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>
                        </div>

                        {/* Secondo Nome */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                                Secondo Nome <span className="text-gray-500 text-[10px] font-normal lowercase">(facoltativo)</span>
                            </label>
                            <Field
                                type="text"
                                name="middleName"
                                disabled={isSubmitting}
                                placeholder="es. Luigi"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Selezione Ruolo (se Admin e non sta modificando se stesso) */}
                        {loggedUser?.role === 3 && (user ? user.id !== loggedUser?.id : true) ? (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ruolo</label>
                                <Field
                                    as="select"
                                    name="role"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value={1}>Utente Standard</option>
                                    <option value={2}>Manager</option>
                                    <option value={3}>Amministratore</option>
                                </Field>
                                <ErrorMessage name="role" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>
                        ) : null}

                        {/* Footer con bottoni di azione */}
                        <div className="pt-4 border-t border-gray-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 font-medium rounded text-sm cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded text-sm cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {isSubmitting ? (isEdit ? 'Salvataggio...' : 'Creazione...') : (isEdit ? 'Salva Modifiche' : 'Crea Utente')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}