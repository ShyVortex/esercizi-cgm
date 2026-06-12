"use client";

import React from "react";
import Modal from 'react-modal';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from 'sweetalert2';
import { State } from '@/models/types/Task';
import { createStateAction, updateStateAction } from "../actions/state.actions";
import { useRouter } from "next/navigation";
 
if (typeof window !== 'undefined') {
    Modal.setAppElement('#root');
}
 
type Props = {
    isOpen: boolean;
    onClose: () => void;
    state?: State | null;
}
 
const StateValidationSchema = Yup.object().shape({
    name: Yup.string().required("Il nome dello stato è obbligatorio."),
    priority: Yup.string().oneOf(["none", "low", "medium", "high"], "La priorità deve essere none, low, medium o high.").required("La priorità è obbligatoria."),
    isActive: Yup.boolean().required()
});
 
export default function StateModal({ isOpen, onClose, state }: Props) {
    const isEdit = !!state;
    const router = useRouter();
 
    const initialValues = {
        name: state?.name || "",
        priority: state?.priority || "medium",
        isActive: state ? state.isActive : true
    };
 
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={isEdit ? "Modifica Stato" : "Crea Nuovo Stato"}
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
                <h2 className="text-lg font-semibold text-white m-0">
                    {isEdit ? 'Modifica Stato' : 'Crea Nuovo Stato'}
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
                validationSchema={StateValidationSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                    const saveRequest = {
                        ...(isEdit && state ? { id: state.id } : {}),
                        name: values.name.trim(),
                        priority: values.priority as "none" | "low" | "medium" | "high",
                        isActive: values.isActive
                    };
 
                    const actionToRun = isEdit ? updateStateAction : createStateAction;
 
                    try {
                        const response = await actionToRun({ success: true, message: "" }, saveRequest);
 
                        if (response && response.success === false) {
                            if (response.errors) {
                                setErrors(response.errors);
                            } else {
                                Swal.fire({
                                    title: "Errore!",
                                    text: response.message || "Si è verificato un errore durante il salvataggio.",
                                    icon: "error",
                                    background: "#1f2937",
                                    color: "#fff"
                                });
                            }
                        } else {
                            Swal.fire({
                                title: "Successo!",
                                text: response.message || (isEdit ? "Stato aggiornato con successo." : "Stato creato con successo."),
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
                            text: error instanceof Error ? error.message : "Errore imprevisto.",
                            icon: "error",
                            background: "#1f2937",
                            color: "#fff"
                        });
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="p-6 space-y-4 text-left">
                        {/* Nome */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</label>
                            <Field
                                type="text"
                                name="name"
                                disabled={isSubmitting}
                                placeholder="es. In Revisione"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                            <ErrorMessage name="name" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Priorità */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Priorità</label>
                            <Field
                                as="select"
                                name="priority"
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="none">Nessuna (None)</option>
                                <option value="low">Bassa (Low)</option>
                                <option value="medium">Media (Medium)</option>
                                <option value="high">Alta (High)</option>
                            </Field>
                            <ErrorMessage name="priority" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Attivo */}
                        <div className="flex items-center gap-2 pt-2">
                            <Field
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                disabled={isSubmitting}
                                className="w-4 h-4 rounded text-blue-600 bg-gray-900 border-gray-700 focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-300 font-semibold uppercase tracking-wider cursor-pointer">Attivo</label>
                        </div>

                        {/* Buttons */}
                        <div className="pt-4 border-t border-gray-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 font-medium rounded text-sm cursor-pointer"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-sm cursor-pointer flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {isSubmitting ? 'Salvataggio...' : (isEdit ? 'Salva' : 'Crea')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
