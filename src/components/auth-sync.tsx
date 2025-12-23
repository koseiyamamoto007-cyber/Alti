"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export function AuthSync() {
    const setUserId = useStore((state) => state.setUserId);
    const syncWithSupabase = useStore((state) => state.syncWithSupabase);

    useEffect(() => {
        // 1. Check active session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                console.log("AuthSync: Initial session found", session.user.id);
                setUserId(session.user.id);
                syncWithSupabase().then(() => console.log("AuthSync: Initial sync complete"));
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
                    await syncWithSupabase();
                }
            } else if (event === 'SIGNED_OUT') {
                setUserId(null);
                // Optional: Clear data? 
                // For now, keep local data or maybe clear to avoid privacy leak?
                // Given the user wants to see data on *other* devices, clearing on logout makes sense.
                // But I won't be aggressive so I don't delete unsaved work if network fails.
            }
        });

        return () => subscription.unsubscribe();
    }, [setUserId, syncWithSupabase]);

    return null; // Renderless component
}
