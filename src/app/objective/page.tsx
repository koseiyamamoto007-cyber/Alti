"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ObjectivePage() {
    const router = useRouter();
    const mainGoal = useStore((state) => state.mainGoal);
    const mainGoalDeadline = useStore((state) => state.mainGoalDeadline);
    const mainGoalStartDate = useStore((state) => state.mainGoalStartDate);
    const setMainGoal = useStore((state) => state.setMainGoal);
    const setMainGoalDeadline = useStore((state) => state.setMainGoalDeadline);
    const setMainGoalStartDate = useStore((state) => state.setMainGoalStartDate);

    const [goalInput, setGoalInput] = useState("");
    const [deadlineInput, setDeadlineInput] = useState("");
    const [startDateInput, setStartDateInput] = useState("");

    useEffect(() => {
        if (mainGoal) setGoalInput(mainGoal);
        if (mainGoalDeadline) setDeadlineInput(mainGoalDeadline);
        if (mainGoalStartDate) setStartDateInput(mainGoalStartDate);
    }, [mainGoal, mainGoalDeadline, mainGoalStartDate]);

    const handleSave = () => {
        setMainGoal(goalInput);
        setMainGoalDeadline(deadlineInput);
        setMainGoalStartDate(startDateInput);
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Set Your Main Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">What is your single most important objective?</label>
                        <Input
                            value={goalInput}
                            onChange={(e) => setGoalInput(e.target.value)}
                            placeholder="e.g., Become a Senior Developer"
                            className="bg-slate-800 border-slate-700 text-lg py-6"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm text-slate-400">Start Date (Optional)</label>
                            <Input
                                type="date"
                                value={startDateInput}
                                onChange={(e) => setStartDateInput(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-lg py-6"
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm text-slate-400">Deadline (Optional)</label>
                            <Input
                                type="date"
                                value={deadlineInput}
                                onChange={(e) => setDeadlineInput(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-lg py-6"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => router.back()} className="flex-1 text-slate-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-500 font-bold">
                            Save Goal
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
