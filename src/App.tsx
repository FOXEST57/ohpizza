// ========================================
// IMPORTS - Importation des modules nécessaires
// ========================================

// Import de React - la bibliothèque principale pour créer des interfaces utilisateur
import React from 'react';

// Import des composants de React Router pour la navigation entre les pages
// BrowserRouter (renommé Router) : Composant qui gère l'historique de navigation
// Routes : Conteneur pour toutes les routes de l'application
// Route : Définit une route spécifique (URL → Composant)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import du contexte du panier - permet de partager l'état du panier dans toute l'app
import { CartProvider } from './contexts/CartContext';

// Import des composants de l'interface utilisateur
import Header from './components/Header';     // En-tête du site (logo, navigation)
import Footer from './components/Footer';     // Pied de page (informations, liens)

// Import des pages de l'application
import Home from './pages/Home';           // Page d'accueil
import Menu from './pages/Menu';           // Page du menu des pizzas
import Cart from './pages/Cart';           // Page du panier d'achat
import Admin from './pages/Admin';         // Page d'administration
import Reviews from './pages/Reviews';     // Page des avis clients
import Contact from './pages/Contact';     // Page de contact

// Import du fichier CSS pour les styles globaux de l'application
import './App.css';

// ========================================
// COMPOSANT PRINCIPAL APP
// ========================================

/**
 * Composant App - Le composant racine de notre application
 * 
 * Ce composant est comme le "chef d'orchestre" de notre application.
 * Il organise tous les autres composants et gère la navigation.
 * 
 * Concepts importants :
 * - Composant fonctionnel : Une fonction qui retourne du JSX
 * - JSX : Syntaxe qui mélange HTML et JavaScript
 * - Providers : Composants qui partagent des données avec leurs enfants
 * - Routing : Système de navigation entre les pages
 */
function App() {
  // La fonction return() définit ce que le composant va afficher
  return (
    // CartProvider : Fournit l'accès au panier à tous les composants enfants
    // Grâce à ce provider, n'importe quel composant peut ajouter/supprimer des pizzas du panier
    <CartProvider>
      {/* Router : Active le système de navigation dans l'application */}
      <Router>
        {/* div avec className="App" : Conteneur principal de l'application */}
        <div className="App">
          
          {/* Header : En-tête affiché sur toutes les pages */}
          <Header />
          
          {/* main : Contenu principal qui change selon la page visitée */}
          <main className="main-content">
            
            {/* Routes : Définit toutes les routes (URLs) de l'application */}
            <Routes>
              {/* Chaque Route associe une URL (path) à un composant (element) */}
              
              {/* Route racine "/" → Page d'accueil */}
              <Route path="/" element={<Home />} />
              
              {/* Route "/menu" → Page du menu des pizzas */}
              <Route path="/menu" element={<Menu />} />
              
              {/* Route "/cart" → Page du panier d'achat */}
              <Route path="/cart" element={<Cart />} />
              
              {/* Route "/admin" → Page d'administration (gestion des pizzas) */}
              <Route path="/admin" element={<Admin />} />
              
              {/* Route "/avis" → Page des avis clients */}
              <Route path="/avis" element={<Reviews />} />
              
              {/* Route "/contact" → Page de contact */}
              <Route path="/contact" element={<Contact />} />
            </Routes>
            
          </main>
          
          {/* Footer : Pied de page affiché sur toutes les pages */}
          <Footer />
          
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
