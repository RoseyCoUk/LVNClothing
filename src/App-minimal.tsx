import React from 'react';

const AppMinimal = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Inter, sans-serif',
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#F8F6F1',
      minHeight: '100vh'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#000000',
          marginBottom: '8px'
        }}>
          LVN Clothing
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#800000',
          marginBottom: '16px'
        }}>
          Under His Wings • Psalm 91
        </p>
      </header>
      
      <main style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: '#000000',
          marginBottom: '24px'
        }}>
          Welcome to LVN Clothing
        </h2>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#000000',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          Premium Christian streetwear inspired by Psalm 91. 
          Shelter. Strength. Style.
        </p>
        
        <blockquote style={{
          fontSize: '20px',
          fontStyle: 'italic',
          color: '#800000',
          borderLeft: '4px solid #800000',
          paddingLeft: '20px',
          marginBottom: '32px'
        }}>
          "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty."
          <footer style={{ fontSize: '16px', marginTop: '8px' }}>— Psalm 91:1</footer>
        </blockquote>
        
        <button style={{
          backgroundColor: '#800000',
          color: '#FFFFFF',
          border: 'none',
          padding: '16px 32px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          borderRadius: '0',
          transition: 'background-color 0.2s'
        }}>
          Shop Collection
        </button>
      </main>
      
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '40px',
        color: '#666666',
        fontSize: '14px'
      }}>
        <p>© 2024 LVN Clothing. All rights reserved.</p>
        <p style={{ marginTop: '8px' }}>
          Shelter. Strength. Style. • Under His Wings - Psalm 91
        </p>
      </footer>
    </div>
  );
};

export default AppMinimal;
