import { useCreateSession } from "@/hooks/use-sessions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSessionSchema } from "@shared/schema";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, Users, Gamepad2, User, MapPin, Hash, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Need to handle Date object from calendar to timestamp string for Zod
const formSchema = insertSessionSchema.extend({
  date: z.date(), // Override schema for form handling
});
type SessionFormValues = z.infer<typeof formSchema>;

export default function Track() {
  const createMutation = useCreateSession();
  const { toast } = useToast();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      branch: "",
      tableNumber: "",
      guruName: "",
      playerNames: [],
      notes: "",
      gameId: 0, // Should be optional in schema but making it 0 here
    },
  });

  const onSubmit = (data: SessionFormValues) => {
    // Transform array string if needed or handle properly
    createMutation.mutate({
      ...data,
      date: data.date, // API expects Date object anyway based on schema type
    }, {
      onSuccess: () => {
        form.reset();
        toast({ title: "Session Logged", description: "Tracking data saved successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Track Session</h2>
        <p className="text-gray-500">Log a new gameplay session</p>
      </div>

      <Card className="p-6 md:p-8 rounded-3xl border-none shadow-xl bg-white">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" /> Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl h-12 border-2 hover:bg-gray-50">
                    {form.watch("date") ? format(form.watch("date"), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => date && form.setValue("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Time is implicit in Date for now, or add separate time field if strictly needed. Keeping simple. */}
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Branch
              </label>
              <Select onValueChange={(val) => form.setValue("branch", val)}>
                <SelectTrigger className="h-12 rounded-xl border-2">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downtown">Downtown</SelectItem>
                  <SelectItem value="westside">Westside</SelectItem>
                  <SelectItem value="uptown">Uptown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Table No.
              </label>
              <Input {...form.register("tableNumber")} placeholder="e.g. T-4" className="h-12 rounded-xl border-2" />
            </div>
          </div>

          {/* Game & Guru */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-primary" /> Game ID (Optional)
              </label>
              <Input 
                type="number" 
                {...form.register("gameId", { valueAsNumber: true })} 
                placeholder="Game ID" 
                className="h-12 rounded-xl border-2" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Guru Name
              </label>
              <Input {...form.register("guruName")} placeholder="Who ran this?" className="h-12 rounded-xl border-2" />
            </div>
          </div>

          {/* Players */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Players
            </label>
            <Textarea 
              placeholder="Enter player names (comma separated)" 
              className="rounded-xl border-2 resize-none min-h-[100px]"
              onChange={(e) => form.setValue("playerNames", e.target.value.split(",").map(s => s.trim()))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Notes</label>
            <Input {...form.register("notes")} placeholder="Any observations?" className="h-12 rounded-xl border-2" />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:to-purple-700 shadow-xl shadow-primary/30 transition-all hover:scale-[1.01]"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Log Session"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
