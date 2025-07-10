interface MainContainerProps {  
  children: React.ReactNode;
}

export const MainContainer = ({ children }: MainContainerProps) => {

  return <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', minHeight: '100dvh' }}>
    {children}
  </div>;
};