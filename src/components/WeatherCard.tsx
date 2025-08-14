import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CurrentWeather {
  temp_c: number;
  condition: {
    text: string;
    icon: string;
  };
}

interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

interface WeatherData {
  current: CurrentWeather;
  forecast: {
    forecastday: ForecastDay[];
  };
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_KEY = '6315ad5252f243a1b15125820251408';
  const SALVADOR_QUERY = 'Salvador,Bahia,Brazil';

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(false);
      
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${SALVADOR_QUERY}&days=5&lang=pt`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Atualizar a cada 1 hora (60 minutos)
    const interval = setInterval(fetchWeather, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <i className="fas fa-cloud-sun text-primary text-xl"></i>
          <h2 className="text-lg font-semibold text-foreground">Clima - Salvador</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Clima atual */}
          <div className="md:col-span-1 bg-muted/50 rounded-lg p-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-12 w-12 rounded" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
          
          {/* Previsão */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-4 text-center">
              <Skeleton className="h-4 w-8 mb-2 mx-auto" />
              <Skeleton className="h-10 w-10 rounded mx-auto mb-2" />
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <i className="fas fa-cloud-exclamation text-muted-foreground text-xl"></i>
          <h2 className="text-lg font-semibold text-foreground">Clima - Salvador</h2>
        </div>
        
        <div className="text-center py-6">
          <i className="fas fa-exclamation-triangle text-warning text-2xl mb-2"></i>
          <p className="text-muted-foreground">Clima indisponível no momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <i className="fas fa-cloud-sun text-primary text-xl"></i>
        <h2 className="text-lg font-semibold text-foreground">Clima - Salvador</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Clima atual */}
        <div className="md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">Agora</p>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={`https:${weather.current.condition.icon}`}
              alt={weather.current.condition.text}
              className="w-12 h-12"
            />
            <span className="text-2xl font-bold text-foreground">
              {Math.round(weather.current.temp_c)}°C
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-tight">
            {weather.current.condition.text}
          </p>
        </div>
        
        {/* Previsão para os próximos 4 dias */}
        {weather.forecast.forecastday.slice(1, 5).map((day) => (
          <div key={day.date} className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {getDayName(day.date)}
            </p>
            <img 
              src={`https:${day.day.condition.icon}`}
              alt={day.day.condition.text}
              className="w-10 h-10 mx-auto mb-2"
            />
            <p className="text-lg font-semibold text-foreground">
              {Math.round(day.day.maxtemp_c)}°
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}