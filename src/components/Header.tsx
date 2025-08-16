// ========================================
// COMPOSANT HEADER - EN-TÊTE DU SITE
// ========================================

/**
 * Ce composant représente l'en-tête (header) de notre site web.
 * Il contient le logo, le menu de navigation et l'indicateur du panier.
 * 
 * Concepts démontrés ici :
 * - Utilisation d'un hook personnalisé (useCart)
 * - Navigation avec React Router (Link)
 * - Rendu conditionnel (affichage du badge seulement si items > 0)
 * - Import et utilisation de CSS
 */

// Import de React - nécessaire pour créer des composants
import React from 'react';

// Import de Link depuis React Router pour la navigation
// Link crée des liens qui changent l'URL sans recharger la page
import { Link } from 'react-router-dom';

// Import de notre hook personnalisé pour accéder au panier
import { useCart } from '../contexts/CartContext';

// Import du fichier CSS pour les styles du header
import './Header.css';

// ========================================
// COMPOSANT HEADER
// ========================================

/**
 * Composant Header - En-tête du site
 * 
 * React.FC = React Functional Component
 * Cela indique à TypeScript que c'est un composant fonctionnel React
 * 
 * Ce composant est "pur" : il ne fait que afficher des données,
 * il ne les modifie pas directement.
 */
const Header: React.FC = () => {
  
  // ========================================
  // UTILISATION DU CONTEXT DU PANIER
  // ========================================
  
  /**
   * Utilisation du hook useCart() pour accéder aux données du panier
   * 
   * Destructuring : on extrait seulement getTotalItems du Context
   * On pourrait aussi écrire :
   * const cart = useCart();
   * const totalItems = cart.getTotalItems();
   */
  const { getTotalItems } = useCart();
  
  /**
   * Calcul du nombre total d'articles dans le panier
   * 
   * Cette variable se met à jour automatiquement quand le panier change
   * grâce au système de Context React
   */
  const totalItems = getTotalItems();

  // ========================================
  // RENDU DU COMPOSANT
  // ========================================
  
  /**
   * La fonction return() définit ce que le composant va afficher
   */
  return (
    // Élément HTML <header> avec une classe CSS pour le style
    <header className="header">
      
      {/* Élément <nav> pour la navigation */}
      <nav>
        
        {/* Logo du site */}
        {/* 
          src="/images/..." : chemin vers l'image (dossier public)
          alt="..." : texte alternatif pour l'accessibilité
          className="logo" : classe CSS pour le style
        */}
        <img src="/images/ebauche1logoOhpizzapng.png" alt="logo oh'pizza" className="logo" />
        
        {/* Liste de navigation */}
        <ul>
          
          {/* Chaque <li> contient un lien de navigation */}
          
          {/* Link to="/admin" : navigue vers la page d'administration */}
          <li><Link to="/admin">ADMIN</Link></li>
          
          {/* Link to="/" : navigue vers la page d'accueil (racine) */}
          <li><Link to="/">Accueil</Link></li>
          
          {/* Link to="/menu" : navigue vers la page du menu */}
          <li><Link to="/menu">La carte</Link></li>
          
          {/* Link to="/contact" : navigue vers la page de contact */}
          <li><Link to="/contact">Nous trouver</Link></li>
          
          {/* Link to="/avis" : navigue vers la page des avis */}
          <li><Link to="/avis">Les avis</Link></li>
          
          {/* Link to="#" : lien inactif (pas encore implémenté) */}
          <li><Link to="#">Mon compte</Link></li>
          
          {/* Lien vers le panier avec indicateur du nombre d'articles */}
          <li>
            <Link to="/cart">
              {/* Texte "Panier" suivi d'un badge conditionnel */}
              Panier {/* 
                Rendu conditionnel avec l'opérateur &&
                Si totalItems > 0 est vrai, alors affiche le <span>
                Si totalItems = 0, n'affiche rien
                
                Explication :
                - totalItems > 0 && <span>... : "ET logique"
                - Si la première partie est vraie, évalue la seconde
                - Si la première partie est fausse, ignore la seconde
              */}
              {totalItems > 0 && <span className="cart-badge">({totalItems})</span>}
            </Link>
          </li>
          
        </ul>
      </nav>
    </header>
  );
};

// ========================================
// EXPORT DU COMPOSANT
// ========================================

/**
 * Export par défaut du composant Header
 * 
 * Cela permet à d'autres fichiers d'importer ce composant avec :
 * import Header from './components/Header';
 */
export default Header;

/**
 * RÉSUMÉ DES CONCEPTS UTILISÉS :
 * 
 * 1. **Hook personnalisé** : useCart() pour accéder au panier
 * 2. **Destructuring** : const { getTotalItems } = useCart()
 * 3. **Navigation** : Link de React Router pour changer de page
 * 4. **Rendu conditionnel** : {condition && <element>}
 * 5. **Props HTML** : src, alt, className
 * 6. **Structure sémantique** : <header>, <nav>, <ul>, <li>
 * 7. **CSS Modules** : import './Header.css'
 * 8. **TypeScript** : React.FC pour typer le composant
 * 
 * Ce composant démontre comment :
 * - Utiliser des données globales (Context)
 * - Créer une navigation fonctionnelle
 * - Afficher des informations dynamiques (nombre d'articles)
 * - Structurer un composant React proprement
 */