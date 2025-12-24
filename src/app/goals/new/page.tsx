"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    hours: z.coerce.number().min(0, { message: "Hours must be positive." }),
    minutes: z.coerce.number().min(0, { message: "Minutes must be positive." }).max(59, { message: "Minutes must be under 60." }),
    color: z.string().min(1, { message: "Please select a theme color." }),
}).refine((data) => data.hours > 0 || data.minutes >= 5, {
    message: "Duration must be at least 5 minutes.",
    path: ["minutes"],
});

// Helper to format minutes to "H hours M minutes"
const formatDuration = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours} hours ${minutes} mins`;
    if (hours > 0) return `${hours} hours`;
    return `${minutes} mins`;
};

const COLORS = [
    { label: "Blue", value: "!bg-blue-500", border: "border-blue-500" },
    { label: "Green", value: "!bg-green-500", border: "border-green-500" },
    { label: "Red", value: "!bg-red-500", border: "border-red-500" },
    { label: "Purple", value: "!bg-purple-500", border: "border-purple-500" },
    { label: "Orange", value: "!bg-orange-500", border: "border-orange-500" },
];

export default function NewGoalPage() {
    const router = useRouter();
    const addGoal = useStore((state) => state.addGoal);
    const updateGoal = useStore((state) => state.updateGoal);
    const goals = useStore((state) => state.goals);
    const deleteGoal = useStore((state) => state.deleteGoal);

    const [editingId, setEditingId] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            hours: 1,
            minutes: 0,
            color: "!bg-blue-500",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const totalMinutes = (values.hours * 60) + values.minutes;

        if (editingId) {
            updateGoal(editingId, {
                title: values.title,
                defaultDuration: totalMinutes,
                color: values.color,
            });
            setEditingId(null);
        } else {
            addGoal({
                title: values.title,
                defaultDuration: totalMinutes,
                color: values.color,
                createdAt: new Date(),
                deadline: new Date(),
            });
        }
        form.reset({
            title: "",
            hours: 1,
            minutes: 0,
            color: "bg-blue-500",
        });
    }

    const startEditing = (goal: any) => {
        setEditingId(goal.id);
        const hours = Math.floor(goal.defaultDuration / 60);
        const minutes = goal.defaultDuration % 60;

        form.reset({
            title: goal.title,
            hours: hours,
            minutes: minutes,
            color: goal.color,
        });
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEditing = () => {
        setEditingId(null);
        form.reset({
            title: "",
            hours: 1,
            minutes: 0,
            color: "bg-blue-500",
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 gap-8">
            <h1 className="text-3xl font-bold text-white">Task Manager</h1>

            <Card className="w-full max-w-2xl border-slate-800 bg-slate-900 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        {editingId ? "Edit Task" : "Create New Task"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Master Next.js" {...field} className="bg-slate-800 border-slate-700" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name="hours"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Hours</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} {...field} value={field.value as number} className="bg-slate-800 border-slate-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="minutes"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Minutes</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={0} max={59} {...field} value={field.value as number} className="bg-slate-800 border-slate-700" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Theme Color</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                // If value changes programmatically (reset), RadioGroup needs key or explicit value to re-render properly
                                                value={field.value}
                                                className="flex gap-4"
                                            >
                                                {COLORS.map((c) => (
                                                    <FormItem key={c.value} className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={c.value}
                                                                id={c.value}
                                                                className={cn("w-8 h-8 rounded-full border-2 [&_svg]:fill-white", c.value, field.value === c.value ? "ring-2 ring-offset-2 ring-white ring-offset-slate-900" : "opacity-50 hover:opacity-100")}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button type="submit" className={cn("flex-1 font-bold py-3 text-white", editingId ? "bg-green-600 hover:bg-green-500" : "bg-indigo-600 hover:bg-indigo-500")}>
                                    {editingId ? "Update Task" : "Create Task"}
                                </Button>
                                {editingId && (
                                    <Button type="button" variant="outline" onClick={cancelEditing} className="border-slate-700 text-slate-400 hover:text-white">
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Task List Table */}
            <Card className="w-full max-w-2xl border-slate-800 bg-slate-900 text-slate-100">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Existing Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    {goals.length === 0 ? (
                        <div className="text-center text-slate-500 py-4">No tasks found.</div>
                    ) : (
                        <div className="w-full overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Task Name</th>
                                        <th className="px-4 py-3">Duration</th>
                                        <th className="px-4 py-3">Registered</th>
                                        <th className="px-4 py-3">Color</th>
                                        <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {goals.map((goal) => (
                                        <tr key={goal.id} className={cn("border-b border-slate-800/50 hover:bg-slate-800/30", editingId === goal.id ? "bg-slate-800/50" : "")}>
                                            <td className="px-4 py-3 font-medium">{goal.title}</td>
                                            <td className="px-4 py-3 min-w-[120px]">{formatDuration(goal.defaultDuration)}</td>
                                            <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                                                {goal.createdAt ? format(new Date(goal.createdAt), 'yyyy/MM/dd HH:mm') : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={cn("w-4 h-4 rounded-full", goal.color)} />
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={editingId === goal.id}
                                                    onClick={() => startEditing(goal)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this task?')) {
                                                            deleteGoal(goal.id);
                                                            if (editingId === goal.id) cancelEditing();
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Button variant="outline" onClick={() => router.push('/')} className="border-slate-700 text-slate-400 hover:text-white">
                Back to Dashboard
            </Button>
        </div>
    );
}
