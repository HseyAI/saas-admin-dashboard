import { useState } from "react";
import { useEvents, useCreateEvent } from "@/hooks/use-events";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema, type InsertCalendarEvent } from "@shared/schema";
import { format, isSameDay } from "date-fns";
import { Plus, Clock, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const eventFormSchema = insertEventSchema.extend({
  date: z.date(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: events } = useEvents();

  const selectedDateEvents = events?.filter(e => date && isSameDay(new Date(e.date), date)) || [];

  return (
    <div className="pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Calendar */}
      <div className="lg:col-span-7 xl:col-span-8">
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white h-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full flex justify-center p-4"
            classNames={{
              head_cell: "text-muted-foreground font-normal text-[1rem] w-12",
              cell: "h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-colors",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg shadow-primary/30",
              day_today: "bg-accent text-accent-foreground font-bold",
            }}
            modifiers={{
              hasEvent: (d) => events?.some(e => isSameDay(new Date(e.date), d)) || false
            }}
            modifiersStyles={{
              hasEvent: { fontWeight: 'bold' }
            }}
            components={{
              DayContent: (props) => (
                <div className="relative flex items-center justify-center w-full h-full">
                  {props.date.getDate()}
                  {events?.some(e => isSameDay(new Date(e.date), props.date)) && (
                    <div className="absolute bottom-2 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </div>
              )
            }}
          />
        </Card>
      </div>

      {/* Right Column: Agenda */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800">
              {date ? format(date, "MMMM d") : "Select a date"}
            </h2>
            <p className="text-gray-500 font-medium">
              {selectedDateEvents.length} events scheduled
            </p>
          </div>
          <AddEventDialog defaultDate={date} />
        </div>

        <div className="space-y-3">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <Card key={event.id} className="p-4 border-none shadow-md rounded-2xl flex items-start gap-4 hover:shadow-lg transition-all cursor-pointer group">
                <div className={`mt-1.5 w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(event.date), "h:mm a")}
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="capitalize">{event.type}</span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                      {event.description}
                    </p>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CalendarIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p>No events for this day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper for dot colors
function getEventTypeColor(type: string) {
  switch(type) {
    case 'meeting': return 'bg-blue-500';
    case 'deadline': return 'bg-red-500';
    case 'event': return 'bg-purple-500';
    default: return 'bg-gray-400';
  }
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  );
}

function AddEventDialog({ defaultDate }: { defaultDate?: Date }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateEvent();
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      type: "meeting",
      date: defaultDate || new Date(),
      description: "",
    },
  });

  const onSubmit = (data: EventFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Event Added", description: "Successfully added to calendar." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-xl h-10 w-10 bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90">
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input {...form.register("title")} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select onValueChange={(v) => form.setValue("type", v)} defaultValue="meeting">
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Simple Time handling for MVP - native inputs */}
            <div className="space-y-2">
               <label className="text-sm font-medium">Time (Approx)</label>
               <Input type="time" className="rounded-xl" onChange={(e) => {
                 const [hours, mins] = e.target.value.split(':');
                 const newDate = new Date(form.getValues("date"));
                 newDate.setHours(parseInt(hours), parseInt(mins));
                 form.setValue("date", newDate);
               }} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input {...form.register("description")} className="rounded-xl" />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Save Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
