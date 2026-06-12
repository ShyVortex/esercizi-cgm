"use client";

import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from 'sweetalert2';
import { Project } from '@/models/types/Project';
import { State } from '@/models/types/Task';
import { apiService } from "../api/api.service";
import { createProjectAction, updateProjectAction } from "../actions/project.actions";
import { useRouter } from "next/navigation";
 
if (typeof window !== 'undefined') {
    Modal.setAppElement('#root');
}
 
type Props = {
    isOpen: boolean;
    onClose: () => void;
    project?: Project | null;
}
 
const ProjectValidationSchema = Yup.object().shape({
    title: Yup.string().required("Il titolo è obbligatorio."),
    description: Yup.string().required("La descrizione è obbligatoria."),
    stateId: Yup.string().required("Lo stato è obbligatorio."),
    isActive: Yup.boolean().required()
});
 
export default function ProjectModal({ isOpen, onClose, project }: Props) {
    const [states, setStates] = useState<State[]>([]);
    const isEdit = !!project;
    const router = useRouter();
 
    useEffect(() => {
        if (!isOpen) return;
        
        (async () => {
            try {
                const sData = await apiService.get<State[]>("/states?isActive=true");
                setStates(sData || []);
            } catch (error) {
                console.error("Error loading states for project:", error);
            }
        })();
    }, [isOpen]);
 
    const initialValues = {
        title: project?.title || "",
        description: project?.description || "",
        stateId: project?.stateId || "",
        isActive: project ? project.isActive : true
    };
 
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={isEdit ? "Modifica Progetto" : "Crea Nuovo Progetto"}
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
                <h2 className="text-lg font-semibold text-white m-0">
                    {isEdit ? 'Modifica Progetto' : 'Crea Nuovo Progetto'}
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
                validationSchema={ProjectValidationSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                    const saveRequest = {
                        ...(isEdit && project ? { id: project.id } : {}),
                        title: values.title.trim(),
                        description: values.description.trim(),
                        stateId: values.stateId,
                        isActive: values.isActive
                    };
 
                    const actionToRun = isEdit ? updateProjectAction : createProjectAction;
 
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
                                    text: response.message || (isEdit ? "Progetto aggiornato con successo." : "Progetto creato con successo."),
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
                        {/* Titolo */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Titolo</label>
                            <Field
                                type="text"
                                name="title"
                                disabled={isSubmitting}
                                placeholder="es. Replatforming E-commerce"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            />
                            <ErrorMessage name="title" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Descrizione */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrizione</label>
                            <Field
                                as="textarea"
                                name="description"
                                disabled={isSubmitting}
                                placeholder="Dettaglio del progetto..."
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[80px]"
                            />
                            <ErrorMessage name="description" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Stato */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stato</label>
                            <Field
                                as="select"
                                name="stateId"
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Seleziona Stato</option>
                                {states.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="stateId" component="span" className="text-red-500 text-xs mt-1 block" />
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
