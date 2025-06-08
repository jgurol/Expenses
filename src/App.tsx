
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CategoriesPage from "./pages/Categories";
import SourcePage from "./pages/Source";
import Reconcile from "./pages/Reconcile";
import Reconciled from "./pages/Reconciled";
import Classifier from "./pages/Classifier";
import UserManagement from "./pages/UserManagement";
import ArchivedExpenses from "./pages/ArchivedExpenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/sources" element={
              <ProtectedRoute>
                <SourcePage />
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            } />
            <Route path="/reconcile" element={
              <ProtectedRoute>
                <Reconcile />
              </ProtectedRoute>
            } />
            <Route path="/reconciled" element={
              <ProtectedRoute>
                <Reconciled />
              </ProtectedRoute>
            } />
            <Route path="/classifier" element={
              <ProtectedRoute>
                <Classifier />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/archived" element={
              <ProtectedRoute requiredRoles={['admin', 'bookkeeper']}>
                <ArchivedExpenses />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
