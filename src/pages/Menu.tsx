// ========================================
// PAGE MENU - AFFICHAGE DES PIZZAS
// ========================================

/**
 * Cette page affiche le menu des pizzas disponibles.
 * Elle démontre plusieurs concepts React avancés :
 * 
 * - Appels API avec axios
 * - Gestion d'état avec useState
 * - Effets de bord avec useEffect
 * - Rendu de listes dynamiques
 * - Gestion d'erreurs et de chargement
 * - Interaction avec le Context (panier)
 */

// Import des hooks React essentiels
import React, { useState, useEffect } from 'react';

// Import d'axios pour les appels API
// axios est une bibliothèque qui simplifie les requêtes HTTP
import axios from 'axios';

// Import d'icônes depuis lucide-react
import { ShoppingCart, Settings } from 'lucide-react';

// Import de notre hook personnalisé pour le panier
import { useCart } from '../contexts/CartContext';

// Import des styles CSS pour cette page
import './Menu.css';

// ========================================
// INTERFACES TYPESCRIPT
// ========================================

/**
 * Interface Pizza - Définit la structure d'une pizza
 * 
 * Ces interfaces nous aident à :
 * - Avoir de l'autocomplétion dans l'éditeur
 * - Détecter les erreurs de typage
 * - Documenter la structure des données
 */
interface Pizza {
  id_pizza: number;        // Identifiant unique de la pizza
  nom_pizza: string;       // Nom de la pizza (ex: "Margherita")
  prix_pizza: number;      // Prix en euros
  image_url?: string;      // URL de l'image (optionnel avec ?)
  category: string;        // Catégorie de la pizza
  ingredients: string;     // Liste des ingrédients
  base?: string;          // Type de pâte (optionnel)
}

/**
 * Interface Category - Définit la structure d'une catégorie
 */
interface Category {
  id_pizza_categories: number;      // Identifiant unique de la catégorie
  nom_pizza_categories: string;     // Nom de la catégorie (ex: "Classiques")
}

// ========================================
// COMPOSANT MENU PRINCIPAL
// ========================================

/**
 * Composant Menu - Affiche la liste des pizzas par catégorie
 */
const Menu: React.FC = () => {
  
  // ========================================
  // HOOKS ET ÉTAT LOCAL
  // ========================================
  
  /**
   * Hook useCart pour accéder aux fonctions du panier
   * On extrait seulement addToCart car c'est tout ce dont on a besoin ici
   */
  const { addToCart } = useCart();
  
  /**
   * États locaux avec useState
   * 
   * Chaque useState crée une paire [valeur, fonction_pour_changer_valeur]
   * React re-rend le composant automatiquement quand ces valeurs changent
   */
  
  // Liste des pizzas récupérées depuis l'API
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  
  // Liste des catégories récupérées depuis l'API
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Catégorie actuellement sélectionnée (pour filtrage futur)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Indicateur de chargement (true pendant que l'API répond)
  const [loading, setLoading] = useState(true);
  
  // Message d'erreur (null si pas d'erreur, string si erreur)
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // EFFET DE BORD - CHARGEMENT DES DONNÉES
  // ========================================
  
  /**
   * useEffect - Hook pour les "effets de bord"
   * 
   * Un effet de bord = quelque chose qui se passe "à côté" du rendu :
   * - Appels API
   * - Timers
   * - Abonnements
   * - Manipulation du DOM
   * 
   * useEffect(fonction, dépendances)
   * - fonction : ce qui doit s'exécuter
   * - dépendances : quand ré-exécuter ([] = une seule fois au montage)
   */
  useEffect(() => {
    fetchData();  // Charger les données au montage du composant
  }, []);  // [] signifie "exécuter une seule fois quand le composant se monte"
  
  /**
   * Fonction fetchData - Récupère les données depuis l'API
   * 
   * async/await permet d'écrire du code asynchrone de façon synchrone
   * C'est plus lisible que les .then().catch()
   */
  const fetchData = async () => {
    try {
      // Indiquer qu'on commence le chargement
      setLoading(true);
      
      /**
       * Promise.all() lance plusieurs requêtes en parallèle
       * Plus rapide que de les faire une par une
       * 
       * Destructuring : [pizzasResponse, categoriesResponse]
       * récupère les résultats dans l'ordre des promesses
       */
      const [pizzasResponse, categoriesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/pizzas'),      // Récupérer les pizzas
        axios.get('http://localhost:5000/api/categories')   // Récupérer les catégories
      ]);
      
      /**
       * Mise à jour des états avec les données reçues
       * 
       * || (OU logique) : si .data.data n'existe pas, utilise .data
       * Cela gère différents formats de réponse API
       */
      setPizzas(pizzasResponse.data.data || pizzasResponse.data);
      setCategories(categoriesResponse.data.data || categoriesResponse.data);
      
    } catch (err) {
      // En cas d'erreur, mettre à jour l'état d'erreur
      setError('Erreur lors du chargement des données');
      console.error('Erreur:', err);  // Log pour le développeur
      
    } finally {
      // finally s'exécute toujours, succès ou erreur
      setLoading(false);  // Arrêter l'indicateur de chargement
    }
  };

  // ========================================
  // TRAITEMENT DES DONNÉES
  // ========================================
  
  /**
   * Groupement des pizzas par catégorie
   * 
   * Cette logique transforme :
   * - categories: ["Classiques", "Spéciales"]
   * - pizzas: [{category: "Classiques", ...}, {category: "Spéciales", ...}]
   * 
   * En :
   * - groupedPizzas: {
   *     "Classiques": [pizza1, pizza2],
   *     "Spéciales": [pizza3, pizza4]
   *   }
   */
  const groupedPizzas = categories.reduce((acc, category) => {
    /**
     * filter() crée un nouveau tableau avec seulement les éléments
     * qui respectent la condition
     */
    const categoryPizzas = pizzas.filter(pizza => 
      pizza.category === category.nom_pizza_categories
    );
    
    // Si cette catégorie a des pizzas, l'ajouter au résultat
    if (categoryPizzas.length > 0) {
      acc[category.nom_pizza_categories] = categoryPizzas;
    }
    
    return acc;  // Retourner l'accumulateur pour la prochaine itération
  }, {} as Record<string, Pizza[]>);  // Objet vide comme valeur initiale

  // ========================================
  // FONCTIONS DE GESTION D'ÉVÉNEMENTS
  // ========================================
  
  /**
   * Fonction handleAddToCart - Ajouter une pizza au panier
   * 
   * Cette fonction :
   * 1. Utilise la fonction addToCart du Context
   * 2. Affiche une confirmation à l'utilisateur
   * 
   * Template literals : `${variable}` pour insérer des variables dans du texte
   */
  const handleAddToCart = (pizza: Pizza) => {
    addToCart(pizza);  // Ajouter au panier via le Context
    alert(`${pizza.nom_pizza} ajoutée au panier !`);  // Confirmation utilisateur
  };

  /**
   * Fonction customizePizza - Personnaliser une pizza
   * 
   * Fonctionnalité future pour personnaliser les pizzas
   * Pour l'instant, juste un placeholder
   */
  const customizePizza = (pizza: Pizza) => {
    // Logique de personnalisation (à implémenter dans une future version)
    console.log('Personnalisation de:', pizza);
    alert(`Personnalisation de ${pizza.nom_pizza} - Fonctionnalité à venir !`);
  };

  // ========================================
  // RENDU CONDITIONNEL - GESTION DES ÉTATS
  // ========================================
  
  /**
   * Rendu conditionnel pour l'état de chargement
   * 
   * Si loading = true, on affiche seulement le spinner de chargement
   * et on arrête l'exécution avec return (le reste ne s'affiche pas)
   */
  if (loading) {
    return (
      <div className="menu-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du menu...</p>
      </div>
    );
  }

  /**
   * Rendu conditionnel pour l'état d'erreur
   * 
   * Si error n'est pas null, on affiche le message d'erreur
   * avec un bouton pour réessayer
   */
  if (error) {
    return (
      <div className="menu-error">
        <h2>Erreur</h2>
        <p>{error}</p>
        {/* onClick={fetchData} : quand on clique, relancer fetchData */}
        <button onClick={fetchData} className="btn btn-discover-menu">
          Réessayer
        </button>
      </div>
    );
  }

  // ========================================
  // RENDU PRINCIPAL - AFFICHAGE DU MENU
  // ========================================
  
  /**
   * Si on arrive ici, c'est que :
   * - loading = false (données chargées)
   * - error = null (pas d'erreur)
   * 
   * On peut donc afficher le menu complet
   */
  return (
    <div className="menu">
      <div className="container">
        
        {/* En-tête de la page */}
        <header className="menu-header">
          <h1>Notre Carte</h1>
          <p>Découvrez nos délicieuses pizzas artisanales</p>
        </header>

        {/* 
          RENDU DE LISTES DYNAMIQUES
          
          Object.entries() transforme un objet en tableau de paires [clé, valeur]
          
          Exemple :
          groupedPizzas = {
            "Classiques": [pizza1, pizza2],
            "Spéciales": [pizza3]
          }
          
          Object.entries(groupedPizzas) = [
            ["Classiques", [pizza1, pizza2]],
            ["Spéciales", [pizza3]]
          ]
          
          .map() transforme chaque élément du tableau
        */}
        {Object.entries(groupedPizzas).map(([categoryName, categoryPizzas]) => (
          // Chaque catégorie devient une section
          <div key={categoryName} className="category-section">
            {/* Titre de la catégorie */}
            <h2 className="category-title">{categoryName}</h2>
            
            {/* Grille des pizzas de cette catégorie */}
            <div className="pizzas-grid">
              {/* 
                Deuxième .map() pour afficher chaque pizza de la catégorie
                categoryPizzas est un tableau de pizzas
              */}
              {categoryPizzas.map(pizza => (
                // Chaque pizza devient une carte
                <div key={pizza.id_pizza} className="pizza-card">
                  <div className="pizza-image">
                    {pizza.image_url ? (
                      <img 
                        src={pizza.image_url.startsWith('/uploads/') 
                          ? `http://localhost:5000${pizza.image_url}` 
                          : pizza.image_url.startsWith('/images/') 
                            ? `http://localhost:5000${pizza.image_url}` 
                            : pizza.image_url
                        } 
                        alt={pizza.nom_pizza}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="placeholder-image"><span>🍕</span></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="placeholder-image">
                        <span>🍕</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pizza-info">
                    <div className="pizza-header">
                      <h3 className="pizza-name">{pizza.nom_pizza}</h3>
                      <div className="pizza-price-badge">
                        <span className="pizza-price">{pizza.prix_pizza}€</span>
                      </div>
                    </div>
                    
                    <div className="pizza-details">
                      <p className="pizza-ingredients">
                        <span className="ingredients-label">Ingrédients:</span>
                        {pizza.ingredients || 'Ingrédients non spécifiés'}
                      </p>
                      {pizza.base && (
                        <p className="pizza-base">
                          <span className="base-label">Base:</span> {pizza.base}
                        </p>
                      )}
                    </div>
                    
                    <div className="pizza-actions">
                      <button 
                        className="btn-customize"
                        onClick={() => customizePizza(pizza)}
                        title="Personnaliser"
                      >
                        <Settings size={16} />
                        <span>Personnaliser</span>
                      </button>
                      <button 
                        className="btn-discover-menu"
                        onClick={() => handleAddToCart(pizza)}
                        title="Ajouter au panier"
                      >
                        <ShoppingCart size={16} />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedPizzas).length === 0 && (
          <div className="no-pizzas">
            <p>Aucune pizza disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;