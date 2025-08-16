// ========================================
// POINT D'ENTRÉE DE L'APPLICATION REACT
// ========================================

/**
 * Ce fichier est le "démarreur" de notre application React.
 * C'est ici que React "s'accroche" à notre page HTML et commence à fonctionner.
 * 
 * Analogie : Si notre app était une voiture, ce fichier serait la clé de contact !
 */

// Import de StrictMode - un outil de développement qui nous aide à détecter les problèmes
// StrictMode active des vérifications supplémentaires et des avertissements utiles
import { StrictMode } from "react";

// Import de createRoot - la fonction qui "monte" notre app React dans le DOM
// DOM = Document Object Model (la structure HTML de la page)
import { createRoot } from "react-dom/client";

// Import de notre composant principal App
import App from "./App";

// Import des styles CSS globaux de l'application
import "./index.css";

// ========================================
// DÉMARRAGE DE L'APPLICATION
// ========================================

/**
 * Étapes du démarrage :
 * 1. Trouve l'élément HTML avec l'id "root" dans index.html
 * 2. Crée une "racine" React à cet endroit
 * 3. Rend (affiche) notre composant App à l'intérieur
 * 
 * Le "!" après getElementById("root") dit à TypeScript :
 * "Je suis sûr que cet élément existe, ne t'inquiète pas"
 */
createRoot(document.getElementById("root")!).render(
  // StrictMode : Mode strict pour détecter les problèmes pendant le développement
  <StrictMode>
    {/* Notre composant App principal qui contient toute l'application */}
    <App />
  </StrictMode>
);

/**
 * Résultat : Notre application React est maintenant "vivante" dans le navigateur !
 * 
 * Flux d'exécution :
 * 1. Le navigateur charge index.html
 * 2. index.html charge ce fichier main.tsx
 * 3. Ce fichier démarre React et affiche le composant App
 * 4. App affiche tous les autres composants (Header, Footer, pages, etc.)
 */
