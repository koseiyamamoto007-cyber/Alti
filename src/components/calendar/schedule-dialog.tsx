"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarEvent, Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, parseISO, addMinutes } from "date-fns";
import { useState } from "react";

const scheduleSchema = z.object({
    goalId: z.string().min(1, "Please select a task"),
    date: z.string().min(1, "Date is required"),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
});

interface ScheduleDialogProps {
    goals: Goal[];
    onSchedule: (data: any) => void;
    defaultDate?: Date;
    trigger?: React.ReactNode;
}

export function ScheduleDialog({ goals, onSchedule, defaultDate = new Date(), trigger }: ScheduleDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof scheduleSchema>>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            goalId: "",
            date: format(defaultDate, "yyyy-MM-dd"),
            startTime: "09:00",
            endTime: "10:00",
        },
    });

    const onSubmit = (values: z.infer<typeof scheduleSchema>) => {
        // Construct ISO strings
        const startDateTime = new Date(`${values.date}T${values.startTime}:00`);
        const endDateTime = new Date(`${values.date}T${values.endTime}:00`);

        const goal = goals.find(g => g.id === values.goalId);

        onSchedule({
            title: goal?.title || "Untitled",
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            goalId: values.goalId,
        });
        setOpen(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="default">Schedule Task</Button>}
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Schedule Task</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="goalId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-slate-800 border-slate-700">
                                                <SelectValue placeholder="Select a task" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                            {goals.map(g => (
                                                <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className="bg-slate-800 border-slate-700" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} className="bg-slate-800 border-slate-700" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} className="bg-slate-800 border-slate-700" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500">Add to Schedule</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
