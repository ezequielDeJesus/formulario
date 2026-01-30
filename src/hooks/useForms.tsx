import { useState, useCallback } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { FormConfig } from '../types';

export const useForms = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getForms = useCallback(async () => {
        if (!user) return [];
        setLoading(true);
        try {
            const q = query(
                collection(db, 'forms'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const forms = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    questions: data.questions || [],
                    products: data.products || []
                };
            }) as FormConfig[];
            return forms;
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getFormBySlug = async (slug: string) => {
        try {
            console.log("Buscando formulário pelo slug:", slug);
            const q = query(collection(db, 'forms'), where('slug', '==', slug));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                console.warn("Nenhum formulário encontrado com slug:", slug);
                return null;
            }
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            console.log("Formulário encontrado:", doc.id, "Total de perguntas:", data.questions?.length);
            return {
                id: doc.id,
                ...data,
                questions: data.questions || [],
                products: data.products || []
            } as FormConfig;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const getFormById = async (id: string) => {
        try {
            const docRef = doc(db, 'forms', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    questions: data.questions || [],
                    products: data.products || []
                } as FormConfig;
            }
            return null;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const saveForm = async (formData: Partial<FormConfig>) => {
        if (!user) throw new Error("Usuário não autenticado");
        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                userId: user.uid,
                updatedAt: serverTimestamp(),
            };

            if (formData.id) {
                const docRef = doc(db, 'forms', formData.id);
                const { id, ...dataWithoutId } = dataToSave;
                await updateDoc(docRef, dataWithoutId);
                return formData.id;
            } else {
                const docRef = await addDoc(collection(db, 'forms'), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
                return docRef.id;
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteForm = async (id: string) => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'forms', id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        getForms,
        getFormBySlug,
        getFormById,
        saveForm,
        deleteForm,
        loading,
        error
    };
};
