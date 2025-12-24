"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export function AuthSync() {
    const setUserId = useStore((state) => state.setUserId);
    const syncWithSupabase = useStore((state) => state.syncWithSupabase);
    const syncLocalToSupabase = useStore((state) => state.syncLocalToSupabase);
    const subscribeToRealtime = useStore((state) => state.subscribeToRealtime);
    const unsubscribeFromRealtime = useStore((state) => state.unsubscribeFromRealtime);

    useEffect(() => {
        // 1. Check active session immediately
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                console.log("AuthSync: Initial session found", session.user.id);
                setUserId(session.user.id);
                // PUSH local data first, then PULL remote data
                await syncLocalToSupabase();
                await syncWithSupabase();
                subscribeToRealtime(); // Start Realtime
                console.log("AuthSync: Initial sync sequence complete");
            }
        });

        // 2. Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("AuthSync: Auth event", event);
            if (session?.user) {
                setUserId(session.user.id);
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    await syncLocalToSupabase();
                    await syncWithSupabase();
                    subscribeToRealtime(); // Start Realtime
                }
            } else if (event === 'SIGNED_OUT') {
                setUserId(null);
                unsubscribeFromRealtime(); // Stop Realtime
            }
        });

        return () => {
            subscription.unsubscribe();
            unsubscribeFromRealtime(); // Cleanup
        };
    }, [setUserId, syncWithSupabase, syncLocalToSupabase, subscribeToRealtime, unsubscribeFromRealtime]);

    return null; // Renderless component
}
