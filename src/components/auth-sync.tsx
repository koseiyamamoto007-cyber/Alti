"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export function AuthSync() {
    const setUserId = useStore((state) => state.setUserId);
    const syncWithSupabase = useStore((state) => state.syncWithSupabase);
    const syncLocalToSupabase = useStore((state) => state.syncLocalToSupabase);

    useEffect(() => {
        // 1. Check active session immediately
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                console.log("AuthSync: Initial session found", session.user.id);
                setUserId(session.user.id);
                // PUSH local data first, then PULL remote data
                await syncLocalToSupabase();
                await syncWithSupabase();
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
                }
            } else if (event === 'SIGNED_OUT') {
                setUserId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [setUserId, syncWithSupabase, syncLocalToSupabase]);

    return null; // Renderless component
}
