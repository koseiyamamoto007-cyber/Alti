"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function DebugSync() {
    const userId = useStore((state) => state.userId);
    const realtimeStatus = useStore((state) => state.realtimeStatus);
    const [status, setStatus] = useState("Idle");
    const [lastError, setLastError] = useState<string | null>(null);

    const handleTestWrite = async () => {
        // ... (existing logic)
    };

    return (
        <div className="fixed top-20 left-4 z-50 bg-black/80 border border-neon-red p-4 rounded-lg text-xs font-mono text-white max-w-[200px]">
            <h3 className="font-bold text-neon-red mb-2">DEBUG SYNC</h3>
            <div className="space-y-1 mb-2">
                <p>User: {userId ? userId.slice(0, 8) + "..." : "NULL"}</p>
                <p>Conn: <span className={realtimeStatus === 'SUBSCRIBED' ? 'text-neon-green' : 'text-yellow-500'}>{realtimeStatus}</span></p>
                <p>Write: {status}</p>
                {lastError && <p className="text-red-500 break-words">{lastError}</p>}
            </div>

            <Button
                onClick={handleTestWrite}
                size="sm"
                variant="destructive"
                className="w-full h-6 text-[10px]"
            >
                Test DB Write
            </Button>
        </div>
    );
}
