import { useState, useCallback } from 'react';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { Lead } from '../types';

export const useLeads = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLeads = useCallback(async () => {
        if (!user) return [];
        setLoading(true);
        try {
            const q = query(
                collection(db, 'leads'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const leads = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toMillis?.() || Date.now()
            })) as Lead[];

            // Client-side sort to avoid missing index error
            return leads.sort((a, b) => b.timestamp - a.timestamp);
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [user]);

    const saveLead = async (leadData: Omit<Lead, 'id' | 'timestamp'>) => {
        setLoading(true);
        try {
            await addDoc(collection(db, 'leads'), {
                ...leadData,
                timestamp: serverTimestamp()
            });
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        getLeads,
        saveLead,
        loading,
        error
    };
};
