import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

interface TimelineData {
  vehicleId: string;
  vehicleName: string;
  vehicleType: string;
  driverName: string;
  dailyStatus: { [key: string]: string };
}

const statusColors = {
  'Funcionando - Operando': 'bg-green-500',
  'Funcionando - Parado': 'bg-green-300',
  'Manutenção - Veiculo': 'bg-red-500',
  'Manutenção - Equipamento': 'bg-red-300',
  'Emprestado': 'bg-yellow-500',
  '': 'bg-gray-200'
};

export default function TimelineModal({ isOpen, onClose, selectedDate }: TimelineModalProps) {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date(selectedDate);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (isOpen) {
      loadTimelineData();
    }
  }, [isOpen, selectedMonth]);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      const year = selectedMonth.split('-')[0];
      const month = selectedMonth.split('-')[1];
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      // Get all vehicle status data for the month
      const { data: statusData, error } = await supabase
        .from('vehicle_status')
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            name,
            type
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Get all unique vehicles first from vehicles table
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*');

      if (vehiclesError) throw vehiclesError;

      // Create timeline data for all vehicles
      const vehicleMap = new Map<string, TimelineData>();
      
      vehiclesData?.forEach(vehicle => {
        vehicleMap.set(vehicle.id, {
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          vehicleType: vehicle.type,
          driverName: vehicle.driver || '',
          dailyStatus: {}
        });
      });

      
      // Add status data to vehicles
      statusData?.forEach(status => {
        const vehicle = status.vehicles as any;
        if (!vehicle) return;

        const vehicleData = vehicleMap.get(vehicle.id);
        if (vehicleData) {
          vehicleData.dailyStatus[status.date] = status.status;
          // Update driver name from status if available
          if (status.driver) {
            vehicleData.driverName = status.driver;
          }
        }
      });

      setTimelineData(Array.from(vehicleMap.values()));
    } catch (error: any) {
      console.error('Error loading timeline data:', error);
      toast({
        title: "Erro ao carregar timeline",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    });
  };

  const days = getDaysInMonth();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Timeline Mensal dos Veículos</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month selector */}
          <div className="flex items-center gap-4">
            <label htmlFor="month-select" className="text-sm font-medium">
              Mês:
            </label>
            <input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            {Object.entries(statusColors).map(([status, color]) => (
              status && (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color}`}></div>
                  <span>{status}</span>
                </div>
              )
            ))}
          </div>

          {/* Timeline table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-auto max-h-[60vh] border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 border-r sticky left-0 bg-muted/50 z-10 min-w-[150px]">
                      Veículo
                    </th>
                    <th className="text-left p-2 border-r sticky left-[150px] bg-muted/50 z-10 min-w-[120px]">
                      Nome Motorista
                    </th>
                    <th className="text-left p-2 border-r sticky left-[270px] bg-muted/50 z-10 min-w-[80px]">
                      Tipo
                    </th>
                    {days.map(date => (
                      <th key={date} className="text-center p-1 border-r min-w-[30px]">
                        {new Date(date).getDate()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timelineData.map(vehicle => (
                    <tr key={vehicle.vehicleId} className="border-b hover:bg-muted/30">
                      <td className="p-2 border-r font-medium sticky left-0 bg-background z-10 min-w-[150px]">
                        {vehicle.vehicleName}
                      </td>
                      <td className="p-2 border-r text-xs sticky left-[150px] bg-background z-10 min-w-[120px]">
                        {vehicle.driverName || '-'}
                      </td>
                      <td className="p-2 border-r text-xs sticky left-[270px] bg-background z-10 min-w-[80px]">
                        {vehicle.vehicleType}
                      </td>
                      {days.map(date => {
                        const status = vehicle.dailyStatus[date] || '';
                        const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-200';
                        return (
                          <td key={`${vehicle.vehicleId}-${date}`} className="p-1 border-r">
                            <div 
                              className={`w-full h-6 rounded ${colorClass}`}
                              title={status || 'Sem dados'}
                            ></div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}