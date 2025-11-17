import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RentStart from "./pages/RentStart";
import RentEnd from "./pages/RentEnd";
import Recent from "./pages/Recent";
import RentalDetail from "./pages/RentalDetail";
import Detect from "./pages/Detect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rent/start" element={<RentStart />} />
          <Route path="/rent/end" element={<RentEnd />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/rentals/:id" element={<RentalDetail />} />
          <Route path="/detect" element={<Detect />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
