import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import StatsCards from '@/components/StatsCards';
import VehicleManagement from '@/components/VehicleManagement';
import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Obtém o dia, mês e ano no fuso horário local
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Mês é base 0
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato "YYYY-MM-DD"
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Até breve!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserInitial = () => {
    const name = user.user_metadata?.full_name || user.email;
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  };

  const formatDate = (dateStr: string) => {
    // Ao criar a data a partir de "YYYY-MM-DD", ela será interpretada como fuso horário local
    // Ex: new Date("2025-07-23") -> Quarta-feira, 23 de julho de 2025 00:00:00 GMT-0300 (Hora Padrão de Brasília)
    const date = new Date(dateStr + 'T00:00:00'); // Adicionar T00:00:00 garante que seja o início do dia local
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Gestão de Frota</h1>
            <p className="text-blue-100 mt-1">
              Controle e monitoramento de veículos UMBS - {formatDate(selectedDate)}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitial()}
              </div>
              <div className="text-right">
                <p className="font-medium">{getUserDisplayName()}</p>
                <p className="text-sm text-blue-100">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-secondary !bg-white/10 !text-white border-white/20 hover:!bg-white/20"
            >
              <i className="fas fa-sign-out-alt"></i>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <StatsCards selectedDate={selectedDate} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Vehicle Management - 2/3 width */}
          <div className="lg:col-span-2">
            <VehicleManagement 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Sidebar - 1/3 width */}
          <div>
            <Sidebar 
              selectedDate={selectedDate} 
              onDataSaved={() => setRefreshTrigger(prev => prev + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
