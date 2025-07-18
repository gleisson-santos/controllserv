import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DailyObservationsProps {
  selectedDate: string;
}

interface Observation {
  id: string;
  date: string;
  content: string;
  created_at: string;
}

export default function DailyObservations({ selectedDate }: DailyObservationsProps) {
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Observation[]>([]);

  useEffect(() => {
    loadObservations();
    loadHistory();
  }, [selectedDate]);

  const loadObservations = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_observations')
        .select('*')
        .eq('date', selectedDate)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setObservations(data?.content || '');
    } catch (error) {
      console.error('Error loading observations:', error);
      setObservations('');
    }
  };

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_observations')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveObservations = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('daily_observations')
        .upsert({
          date: selectedDate,
          content: observations
        });

      if (error) throw error;

      toast({
        title: "Observações salvas",
        description: "Observações diárias salvas com sucesso!",
      });

      loadHistory(); // Reload history to include the new entry
    } catch (error: any) {
      console.error('Error saving observations:', error);
      toast({
        title: "Erro ao salvar observações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const clearObservations = () => {
    setObservations('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getPreview = (content: string, maxLength = 50) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Observações Diárias
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Notas e informações importantes
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <i className="fas fa-calendar-day mr-1"></i>
            Data: {formatDate(selectedDate)}
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring resize-none"
            rows={4}
            style={{ minHeight: '80px' }}
            placeholder="Digite suas observações para o dia..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveObservations}
            disabled={saving}
            className="btn-success flex-1"
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-save"></i>
            )}
            Salvar
          </button>
          <button
            onClick={clearObservations}
            className="btn-secondary flex-1"
          >
            <i className="fas fa-eraser"></i>
            Limpar
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3 pt-4 border-t border-border">
              Histórico de Observações
            </h4>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {formatDate(item.date)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {getPreview(item.content)}
                      </p>
                    </div>
                    {item.content.length > 50 && (
                      <button
                        title={item.content}
                        className="text-xs text-primary hover:text-primary/80 flex-shrink-0"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}