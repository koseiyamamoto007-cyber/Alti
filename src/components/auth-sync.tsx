"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export function AuthSync() {
    const setUserId = useStore((state) => state.setUserId);
    const syncWithSupabase = useStore((state) => state.syncWithSupabase);
    const subscribeToRealtime = useStore((state) => state.subscribeToRealtime);
    const unsubscribeFromRealtime = useStore((state) => state.unsubscribeFromRealtime);

    useEffect(() => {
        // 1. Check active session immediately
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                console.log("AuthSync: Initial session found", session.user.id);
                setUserId(session.user.id);
                // PULL remote data (Server Authority)
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
                    // PULL only. Do not push stale local data.
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
    }, [setUserId, syncWithSupabase, subscribeToRealtime, unsubscribeFromRealtime]);

    return null; // Renderless component
}
