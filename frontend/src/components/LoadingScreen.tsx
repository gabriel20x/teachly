import Lottie from 'lottie-react';
import React from 'react';
import loadingAnimation from '../assets/lotties/loading-animation.json';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <Lottie animationData={loadingAnimation} loop={true} style={{ width: '30vw', aspectRatio: '1/1' }} />
      <h1 className="text-2xl font-bold">{message}</h1>
    </div>
  );
}; 