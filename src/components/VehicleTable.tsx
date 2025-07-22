import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Vehicle, VehicleStatus } from './VehicleManagement';

interface VehicleTableProps {
  vehicles: VehicleStatus[];
  loading: boolean;
  selectedDate: string;
  onEdit: (vehicle: Vehicle) => void;
  onRefresh: () => void;
}

export default function VehicleTable({ vehicles, loading, selectedDate, onEdit, onRefresh }: VehicleTableProps) {


  const deleteVehicle = async (vehicleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Veículo excluído",
        description: "Veículo removido com sucesso!",
      });

      onRefresh();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Erro ao excluir veículo",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Funcionando - Operando':
      case 'Funcionando - Parado':
        return 'status-funcionando';
      case 'Manutenção - Veiculo':
      case 'Manutenção - Equipamento':
        return 'status-quebrado';
      case 'Emprestado':
        return 'status-emprestado';
      default:
        return 'status-funcionando';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
        <p className="mt-2 text-muted-foreground">Carregando veículos...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
              Placa
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
              Motorista
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-44">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Observações
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {vehicles.map((vehicleStatus) => (
            <tr key={vehicleStatus.vehicle_id} className="hover:bg-muted/25">
              <td className="px-4 py-4 text-sm font-medium text-foreground">
                {vehicleStatus.vehicle?.name}
              </td>
              <td className="px-4 py-4 text-sm text-muted-foreground">
                {vehicleStatus.driver || '-'}
              </td>
              <td className="px-4 py-4 text-sm text-muted-foreground">
                {vehicleStatus.vehicle?.type}
              </td>
              <td className="px-4 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(vehicleStatus.status)}`}>
                  {vehicleStatus.status}
                </span>
              </td>
              <td className="px-4 py-4 max-w-xs">
                <div className="text-sm text-muted-foreground truncate" title={vehicleStatus.observations || 'Sem observações'}>
                  {vehicleStatus.observations || 'Sem observações'}
                </div>
              </td>
              <td className="px-4 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => vehicleStatus.vehicle && onEdit(vehicleStatus.vehicle)}
                    className="text-primary hover:text-primary/80 p-1"
                    title="Editar veículo"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => deleteVehicle(vehicleStatus.vehicle_id)}
                    className="text-destructive hover:text-destructive/80 p-1"
                    title="Excluir veículo"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {vehicles.length === 0 && (
        <div className="p-8 text-center">
          <i className="fas fa-car text-4xl text-muted-foreground mb-4"></i>
          <p className="text-muted-foreground">Nenhum veículo cadastrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em "Adicionar Veículo" para começar
          </p>
        </div>
      )}
    </div>
  );
}