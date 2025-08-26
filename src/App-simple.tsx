import React from 'react';

const AppSimple = () => {
  return (
    <div className="min-h-screen bg-lvn-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-lvn-black mb-2">LVN Clothing</h1>
          <p className="text-lvn-maroon">Under His Wings • Psalm 91</p>
        </header>
        
        <main>
          <div className="bg-lvn-off-white p-6 rounded-none shadow-sm">
            <h2 className="text-2xl font-semibold text-lvn-black mb-4">Welcome to LVN Clothing</h2>
            <p className="text-lvn-black mb-4">
              Premium Christian streetwear inspired by Psalm 91. 
              Shelter. Strength. Style.
            </p>
            <p className="text-lvn-black mb-6">
              "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty."
            </p>
            <button className="btn-lvn-primary">
              Shop Collection
            </button>
          </div>
        </main>
        
        <footer className="text-center mt-8 text-lvn-black/70">
          <p>© 2024 LVN Clothing. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AppSimple;
