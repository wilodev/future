import React, { createContext, useContext, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

type AppContextType = {
  welcome: string;
  widthFullScreenCarousel: number;
  setWelcome: (value: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de un proveedor AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [welcome, setWelcome] = useState<string>('');
  const [widthFullScreenCarousel, setWidthFullScreenCarousel] = useState<number>(0);

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    if (width > height) {
      setWidthFullScreenCarousel(height);
    } else {
      setWidthFullScreenCarousel(width);
    }
  }, []);

  return (
    <AppContext.Provider value={{ welcome, setWelcome, widthFullScreenCarousel }}>
      {children}
    </AppContext.Provider>
  );
};
