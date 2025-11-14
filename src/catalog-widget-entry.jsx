// Entry point for the Catalog UMD bundle
import React from 'react';
import ReactDOM from 'react-dom/client';
import Catalog from './components/catalog/Catalog';
import './index.css'; // Import your global styles

// Expose the initialization function globally
window.initProductsWidget = function(containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }

  try {
    // Remove loading fallback
    const loadingFallback = container.querySelector('.products-loading-fallback');
    if (loadingFallback) {
      loadingFallback.remove();
    }

    // Create React root and render the Catalog
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(Catalog));
    
    console.log('Products widget initialized successfully');
  } catch (error) {
    console.error('Error initializing products widget:', error);
    container.innerHTML = `
      <div class="products-error">
        <h3>Unable to load products</h3>
        <p>An error occurred while loading the products catalog.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }
};

// Also expose the Catalog component directly for advanced usage
window.BazarCatalog = Catalog;

// Auto-initialize if a container with id 'products-root' exists on page load
if (typeof document !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const autoInitContainer = document.getElementById('products-root');
      if (autoInitContainer) {
        console.log('Auto-initializing products widget...');
        window.initProductsWidget('products-root');
      }
    });
  } else {
    // DOM is already ready
    const autoInitContainer = document.getElementById('products-root');
    if (autoInitContainer) {
      console.log('Auto-initializing products widget...');
      window.initProductsWidget('products-root');
    }
  }
}
