import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";

// Pages
import Home from "@/pages/Home";
import Members from "@/pages/Members";
import Games from "@/pages/Games";
import Track from "@/pages/Track";
import CalendarPage from "@/pages/CalendarPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/members" component={Members} />
      <Route path="/games" component={Games} />
      <Route path="/track" component={Track} />
      <Route path="/calendar" component={CalendarPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-[#f4f6f8] text-foreground font-sans">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 pb-32">
            <Router />
          </main>
          <Navigation />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
