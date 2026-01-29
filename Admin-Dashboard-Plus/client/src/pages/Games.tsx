import { useState } from "react";
import { useGames, useCreateGame } from "@/hooks/use-games";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Plus, Users, Gamepad2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema } from "@shared/schema";
import { z } from "zod";

type GameFormValues = z.infer<typeof insertGameSchema>;

export default function Games() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  
  const { data: games, isLoading } = useGames({ 
    search: search || undefined, 
    category: category !== "all" ? category : undefined 
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-black text-gray-800">Games Library</h2>
        <AddGameDialog />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search games..." 
            className="pl-10 h-10 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px] h-10 rounded-xl bg-gray-50 border-transparent">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Strategy">Strategy</SelectItem>
            <SelectItem value="Party">Party</SelectItem>
            <SelectItem value="Family">Family</SelectItem>
            <SelectItem value="Abstract">Abstract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : games?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No games found. Add one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games?.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

function GameCard({ game }: { game: any }) {
  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl bg-white h-full flex flex-col">
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
            <Gamepad2 className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
          <Users className="w-3 h-3" />
          {game.minPlayers}-{game.maxPlayers}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{game.category}</div>
        <h3 className="font-bold text-lg text-gray-800 leading-tight mb-2 group-hover:text-primary transition-colors">{game.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-auto">{game.description}</p>
      </div>
    </Card>
  );
}

function AddGameDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateGame();
  
  const form = useForm<GameFormValues>({
    resolver: zodResolver(insertGameSchema),
    defaultValues: {
      title: "",
      category: "Strategy",
      minPlayers: 2,
      maxPlayers: 4,
      description: "",
      imageUrl: "",
    },
  });

  const onSubmit = (data: GameFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Success", description: "Game added to library" });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Add Game
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add New Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input {...form.register("title")} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input {...form.register("category")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input {...form.register("imageUrl")} className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Players</label>
              <Input type="number" {...form.register("minPlayers", { valueAsNumber: true })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Players</label>
              <Input type="number" {...form.register("maxPlayers", { valueAsNumber: true })} className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input {...form.register("description")} className="rounded-xl" />
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Save Game"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
