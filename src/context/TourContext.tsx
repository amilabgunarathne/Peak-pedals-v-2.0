import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Tour {
  id: string;
  name: string;
  category: string;
  duration: string;
  difficulty: string;
  price: string;
  originalPrice?: string;
  image: string;
  gallery?: string;
  rating?: number;
  reviews?: number;
  maxPeople?: number;
  location: string;
  description: string;
  highlights?: string;
  includes?: string;
  itinerary?: string;
  whatToBring?: string;
  difficulty_details?: string;
  most_popular?: string;
}

interface TourContextType {
  tours: Tour[];
  popularTours: Tour[];
  loading: boolean;
  error: string | null;
  fetchTours: () => Promise<void>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTours = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTours must be used within a TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [popularTours, setPopularTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTours = async () => {
    // Don't fetch if we already have data
    if (tours.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbw6k_STSNcKQSsNFEe38OjV_rI72PfTs6cECGbdNwV1sXCDTJJqZ31dxi3x5xtkxe4T/exec');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Data is not an array');
      }

      setTours(data);
      
      // Filter popular tours
      const popular = data.filter((tour: any) => tour && tour.most_popular === 'Yes');
      setPopularTours(popular);
      
      console.log('Tours cached successfully:', data.length, 'tours,', popular.length, 'popular');
    } catch (err) {
      console.error('Error fetching tours:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tours');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchTours();
  }, []);

  const value: TourContextType = {
    tours,
    popularTours,
    loading,
    error,
    fetchTours
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};
