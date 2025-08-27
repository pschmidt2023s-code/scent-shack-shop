import React from 'react';

export default function TestAdmin() {
  console.log('TEST ADMIN PAGE LOADED SUCCESSFULLY!');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '40px', color: 'red' }}>🎉 TEST ADMIN PAGE WORKS! 🎉</h1>
      <p style={{ fontSize: '20px' }}>Dies ist eine einfache Testseite um zu prüfen ob das Routing funktioniert.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'yellow' }}>
        <p>✅ Routing funktioniert!</p>
        <p>✅ Komponente wird geladen!</p>
        <p>✅ Seite wird angezeigt!</p>
      </div>
    </div>
  );
}