"use client";

import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from 'sweetalert2';
import { Task } from '@/models/types/Task';
import { User } from '@/models/types/User';
import { State } from '@/models/types/Task';
import { Project } from '@/models/types/Project';
import { apiService } from "../api/api.service";
import { createTaskAction, updateTaskAction } from "../actions/task.actions";
import { useRouter } from "next/navigation";

if (typeof window !== 'undefined') {
    Modal.setAppElement('#root');
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    task?: Task | null;
}

const TaskValidationSchema = Yup.object().shape({
    title: Yup.string().required("Il titolo è obbligatorio."),
    description: Yup.string().required("La descrizione è obbligatoria."),
    assignedTo: Yup.string().required("L'assegnatario è obbligatorio."),
    start: Yup.date().required("La data di inizio è obbligatoria."),
    end: Yup.date()
        .min(Yup.ref('start'), "La data di fine non può essere precedente a quella d'inizio.")
        .required("La data di fine è obbligatoria."),
    stateId: Yup.string().required("Lo stato è obbligatorio."),
    estimatedLength: Yup.number()
        .typeError("Deve essere un numero decimale.")
        .min(0, "Il tempo stimato non può essere negativo.")
        .required("Il tempo stimato è obbligatorio."),
    effectiveLength: Yup.number()
        .typeError("Deve essere un numero decimale.")
        .min(0, "Il tempo effettivo non può essere negativo.")
        .required("Il tempo effettivo è obbligatorio."),
    projectId: Yup.string().required("Il progetto è obbligatorio."),
    isActive: Yup.boolean().required()
});

export default function TaskModal({ isOpen, onClose, task }: Props) {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const isEdit = !!task;

    useEffect(() => {
        if (!isOpen) return;
        
        // Carica dinamicamente utenti, stati e progetti per i menu a tendina
        (async () => {
            try {
                const uData = await apiService.get<User[]>("/users?isActive=true");
                const sData = await apiService.get<State[]>("/states?isActive=true");
                const pData = await apiService.get<Project[]>("/projects?isActive=true");
                setUsers(uData || []);
                setStates(sData || []);
                setProjects(pData || []);
            } catch (error) {
                console.error("Error loading form options:", error);
            }
        })();
    }, [isOpen]);

    const initialValues = {
        title: task?.title || "",
        description: task?.description || "",
        assignedTo: task?.assignedTo || "",
        start: task?.start || "",
        end: task?.end || "",
        stateId: task?.stateId || "",
        estimatedLength: task?.estimatedLength ?? 0,
        effectiveLength: task?.effectiveLength ?? 0,
        projectId: task?.projectId || "",
        isActive: task ? task.isActive : true
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={isEdit ? "Modifica Attività" : "Crea Nuova Attività"}
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
                <h2 className="text-lg font-semibold text-white m-0">
                    {isEdit ? 'Modifica Attività' : 'Crea Nuova Attività'}
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
                validationSchema={TaskValidationSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                    const saveRequest = {
                        ...(isEdit && task ? { id: task.id } : {}),
                        title: values.title.trim(),
                        description: values.description.trim(),
                        assignedTo: values.assignedTo,
                        start: new Date(values.start),
                        end: new Date(values.end),
                        stateId: values.stateId,
                        estimatedLength: Number(values.estimatedLength),
                        effectiveLength: Number(values.effectiveLength),
                        projectId: values.projectId,
                        isActive: values.isActive
                    };

                    const actionToRun = isEdit ? updateTaskAction : createTaskAction;

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
                                text: isEdit ? "Attività aggiornata con successo." : "Attività creata con successo.",
                                icon: "success",
                                background: "#1f2937",
                                color: "#fff",
                                timer: 2000,
                                showConfirmButton: false
                            });
                            if (response && response.redirectUrl) {
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
                    <Form className="p-6 space-y-4 text-left max-h-[80vh] overflow-y-auto">
                        {/* Titolo */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Titolo</label>
                            <Field
                                type="text"
                                name="title"
                                disabled={isSubmitting}
                                placeholder="es. Progettare DB"
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
                                placeholder="Dettaglio dell'attività..."
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[60px]"
                            />
                            <ErrorMessage name="description" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Assegnatario */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assegnatario</label>
                            <Field
                                as="select"
                                name="assignedTo"
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Seleziona Assegnatario</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.username})</option>
                                ))}
                            </Field>
                            <ErrorMessage name="assignedTo" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Progetto */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progetto</label>
                            <Field
                                as="select"
                                name="projectId"
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Seleziona Progetto</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </Field>
                            <ErrorMessage name="projectId" component="span" className="text-red-500 text-xs mt-1 block" />
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

                        {/* Date Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data Inizio</label>
                                <Field
                                    type="date"
                                    name="start"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                                />
                                <ErrorMessage name="start" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data Fine</label>
                                <Field
                                    type="date"
                                    name="end"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                                />
                                <ErrorMessage name="end" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>
                        </div>

                        {/* Ore Stimate e Effettive */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stima Ore</label>
                                <Field
                                    type="number"
                                    step="0.1"
                                    name="estimatedLength"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                                />
                                <ErrorMessage name="estimatedLength" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ore Effettive</label>
                                <Field
                                    type="number"
                                    step="0.1"
                                    name="effectiveLength"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                                />
                                <ErrorMessage name="effectiveLength" component="span" className="text-red-500 text-xs mt-1 block" />
                            </div>
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
