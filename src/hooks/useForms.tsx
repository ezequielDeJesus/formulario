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
        if (!user) {
            console.warn("getForms: Usuário não autenticado");
            return [];
        }
        setLoading(true);
        try {
            console.log("getForms: Iniciando busca para o usuário:", user.uid);
            const q = query(
                collection(db, 'forms'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const forms = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    questions: data.questions || [],
                    products: data.products || []
                };
            }) as FormConfig[];
            console.log("getForms: Sucesso! Encontrados:", forms.length);
            return forms;
        } catch (err: any) {
            console.error("getForms: Erro na consulta Firestore:", err.message);
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
                ...data,
                id: doc.id,
                questions: data.questions || [],
                products: data.products || []
            } as FormConfig;
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    };

    const getFormById = async (id: string) => {
        setLoading(true);
        try {
            console.log("getFormById: Buscando ID:", id);
            const docRef = doc(db, 'forms', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("getFormById: Encontrado!", {
                    id: docSnap.id,
                    nome: data.name,
                    qCount: data.questions?.length || 0,
                    pCount: data.products?.length || 0
                });
                return {
                    ...data,
                    id: docSnap.id,
                    questions: data.questions || [],
                    products: data.products || []
                } as FormConfig;
            }
            console.warn("getFormById: Documento não existe:", id);
            return null;
        } catch (err: any) {
            console.error("getFormById: Erro:", err.message);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const saveForm = async (formData: Partial<FormConfig>) => {
        if (!user) throw new Error("Usuário não autenticado");
        setLoading(true);
        try {
            console.log("saveForm: Preparando para salvar...", {
                id: formData.id || "NOVO",
                nome: formData.name,
                qCount: formData.questions?.length || 0
            });

            const { id: _, ...dataToSave } = {
                ...formData,
                userId: user.uid,
                updatedAt: serverTimestamp(),
            };

            if (formData.id) {
                const docRef = doc(db, 'forms', formData.id);
                console.log("saveForm: Atualizando documento existente...");
                await updateDoc(docRef, dataToSave);
                console.log("saveForm: Atualização concluída.");
                return formData.id;
            } else {
                console.log("saveForm: Criando novo documento...");
                const docRef = await addDoc(collection(db, 'forms'), {
                    ...dataToSave,
                    createdAt: serverTimestamp()
                });
                console.log("saveForm: Criação concluída. ID:", docRef.id);
                return docRef.id;
            }
        } catch (err: any) {
            console.error("saveForm: Erro ao salvar no Firebase:", err.message);
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
