import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Vehicle } from './VehicleManagement';

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: () => void;
}

export default function VehicleModal({ vehicle, onClose, onSave }: VehicleModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'DESTACK' | 'EMBASA' | 'OUTROS'>('OUTROS');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setName(vehicle.name);
      setType(vehicle.type);
    } else {
      setName('');
      setType('OUTROS');
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (vehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({ name, type })
          .eq('id', vehicle.id);

        if (error) throw error;

        toast({
          title: "Veículo atualizado",
          description: "Veículo atualizado com sucesso!",
        });
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert({ name, type });

        if (error) throw error;

        toast({
          title: "Veículo criado",
          description: "Veículo adicionado com sucesso!",
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Erro ao salvar veículo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {vehicle ? 'Editar Veículo' : 'Adicionar Veículo'}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nome do Veículo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
              placeholder="Ex: Carro 001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'DESTACK' | 'EMBASA' | 'OUTROS')}
              className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
            >
              <option value="DESTACK">DESTACK</option>
              <option value="EMBASA">EMBASA</option>
              <option value="OUTROS">OUTROS</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                vehicle ? 'Atualizar' : 'Adicionar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}