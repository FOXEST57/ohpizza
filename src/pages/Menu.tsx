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
import { ShoppingCart, Settings, Plus, Minus, X } from 'lucide-react';

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

/**
 * Interface Ingredient - Définit la structure d'un ingrédient
 */
interface Ingredient {
  id_ingredients: number;    // Identifiant unique de l'ingrédient
  nom_ingredients: string;   // Nom de l'ingrédient
  prix_ingredients: number;  // Prix de l'ingrédient
  disponible?: boolean;      // Disponibilité de l'ingrédient
}

/**
 * Interface IngredientWithQuantity - Ingrédient avec quantité
 */
interface IngredientWithQuantity {
  ingredient: Ingredient;
  quantity: number;
}

/**
 * Interface CustomizedPizza - Pizza avec modifications temporaires
 */
interface CustomizedPizza extends Pizza {
  addedIngredients: IngredientWithQuantity[];    // Ingrédients ajoutés avec quantités
  removedIngredients: string[];      // Noms des ingrédients supprimés
  finalPrice: number;                // Prix final calculé
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
  
  // États pour la personnalisation
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [addedIngredients, setAddedIngredients] = useState<IngredientWithQuantity[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [customizationLoading, setCustomizationLoading] = useState(false);

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

  /**
   * Fonction fetchIngredients - Récupère les ingrédients disponibles
   */
  const fetchIngredients = async () => {
    try {
      setCustomizationLoading(true);
      const response = await axios.get('http://localhost:5000/api/ingredients');
      const ingredients = response.data.data || response.data;
      // Filtrer seulement les ingrédients disponibles
      setAvailableIngredients(ingredients.filter((ing: Ingredient) => ing.disponible));
    } catch (err) {
      console.error('Erreur lors du chargement des ingrédients:', err);
      alert('Erreur lors du chargement des ingrédients');
    } finally {
      setCustomizationLoading(false);
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
   * Fonction customizePizza - Ouvrir le modal de personnalisation
   */
  const customizePizza = async (pizza: Pizza) => {
    setSelectedPizza(pizza);
    setAddedIngredients([]);
    setRemovedIngredients([]);
    setShowCustomizeModal(true);
    await fetchIngredients();
  };

  /**
   * Fonction closeCustomizeModal - Fermer le modal de personnalisation
   */
  const closeCustomizeModal = () => {
    setShowCustomizeModal(false);
    setSelectedPizza(null);
    setAddedIngredients([]);
    setRemovedIngredients([]);
  };

  /**
   * Fonction addIngredient - Ajouter un ingrédient à la pizza
   */
  const addIngredient = (ingredient: Ingredient) => {
    const existingIngredient = addedIngredients.find(ing => ing.ingredient.id_ingredients === ingredient.id_ingredients);
    
    if (existingIngredient) {
      // Si l'ingrédient existe déjà, augmenter la quantité
      setAddedIngredients(addedIngredients.map(ing => 
        ing.ingredient.id_ingredients === ingredient.id_ingredients 
          ? { ...ing, quantity: ing.quantity + 1 }
          : ing
      ));
    } else {
      // Si l'ingrédient n'existe pas, l'ajouter avec quantité 1
      setAddedIngredients([...addedIngredients, { ingredient, quantity: 1 }]);
    }
  };

  /**
   * Fonction removeAddedIngredient - Supprimer complètement un ingrédient ajouté
   */
  const removeAddedIngredient = (ingredientId: number) => {
    setAddedIngredients(addedIngredients.filter(ing => ing.ingredient.id_ingredients !== ingredientId));
  };

  /**
   * Fonction increaseIngredientQuantity - Augmenter la quantité d'un ingrédient
   */
  const increaseIngredientQuantity = (ingredientId: number) => {
    setAddedIngredients(addedIngredients.map(ing => 
      ing.ingredient.id_ingredients === ingredientId 
        ? { ...ing, quantity: ing.quantity + 1 }
        : ing
    ));
  };

  /**
   * Fonction decreaseIngredientQuantity - Diminuer la quantité d'un ingrédient
   * Si la quantité atteint 0, l'ingrédient est automatiquement supprimé
   */
  const decreaseIngredientQuantity = (ingredientId: number) => {
    setAddedIngredients(addedIngredients.map(ing => {
      if (ing.ingredient.id_ingredients === ingredientId) {
        const newQuantity = ing.quantity - 1;
        return { ...ing, quantity: newQuantity };
      }
      return ing;
    }).filter(ing => ing.quantity > 0)); // Supprimer automatiquement si quantité = 0
  };

  /**
   * Fonction toggleRemovedIngredient - Basculer la suppression d'un ingrédient de base
   */
  const toggleRemovedIngredient = (ingredientName: string) => {
    if (removedIngredients.includes(ingredientName)) {
      setRemovedIngredients(removedIngredients.filter(name => name !== ingredientName));
    } else {
      setRemovedIngredients([...removedIngredients, ingredientName]);
    }
  };

  /**
   * Fonction calculateCustomPrice - Calculer le prix de la pizza personnalisée
   */
  const calculateCustomPrice = () => {
    if (!selectedPizza) return 0;
    const basePrice = parseFloat(selectedPizza.prix_pizza) || 0;
    const addedPrice = addedIngredients.reduce((sum, ing) => {
      const ingredientPrice = parseFloat(ing.ingredient.prix_ingredients) || 0;
      return sum + (ingredientPrice * ing.quantity);
    }, 0);
    return basePrice + addedPrice;
  };

  /**
   * Fonction addCustomizedPizzaToCart - Ajouter la pizza personnalisée au panier
   */
  const addCustomizedPizzaToCart = () => {
    if (!selectedPizza) return;

    const customizedPizza: CustomizedPizza = {
      ...selectedPizza,
      addedIngredients,
      removedIngredients,
      finalPrice: calculateCustomPrice(),
      // Modifier le nom pour indiquer la personnalisation
      nom_pizza: `${selectedPizza.nom_pizza} (Personnalisée)`,
      prix_pizza: calculateCustomPrice()
    };

    addToCart(customizedPizza);
    alert(`${selectedPizza.nom_pizza} personnalisée ajoutée au panier !`);
    closeCustomizeModal();
  };

  /**
   * Fonction getBaseIngredients - Obtenir la liste des ingrédients de base
   */
  const getBaseIngredients = () => {
    if (!selectedPizza?.ingredients) return [];
    return selectedPizza.ingredients.split(',').map(ing => ing.trim());
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

      {/* Modal de personnalisation */}
      {showCustomizeModal && selectedPizza && (
        <div className="customize-modal-overlay" onClick={closeCustomizeModal}>
          <div className="customize-modal pizza-customize-modal" onClick={(e) => e.stopPropagation()}>
            <div className="customize-header">
              <h2>Personnaliser {selectedPizza.nom_pizza}</h2>
              <button className="close-btn" onClick={closeCustomizeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="customize-content">
              {/* Informations de la pizza */}
              <div className="pizza-info-section">
                <div className="pizza-image-small">
                  {selectedPizza.image_url ? (
                    <img 
                      src={selectedPizza.image_url.startsWith('/uploads/') 
                        ? `http://localhost:5000${selectedPizza.image_url}` 
                        : selectedPizza.image_url.startsWith('/images/') 
                          ? `http://localhost:5000${selectedPizza.image_url}` 
                          : selectedPizza.image_url
                      } 
                      alt={selectedPizza.nom_pizza}
                    />
                  ) : (
                    <div className="placeholder-image-small">
                      <span>🍕</span>
                    </div>
                  )}
                </div>
                <div className="pizza-details-small">
                  <h3>{selectedPizza.nom_pizza}</h3>
                  <p className="base-price">Prix de base: {selectedPizza.prix_pizza}€</p>
                  <p className="current-price">Prix actuel: {calculateCustomPrice().toFixed(2)}€</p>
                </div>
              </div>

              {/* Ingrédients de base */}
              <div className="base-ingredients-section">
                <h3>Ingrédients de base</h3>
                <div className="ingredients-list">
                  {(() => {
                    const baseIngredients = getBaseIngredients();
                    console.log('baseIngredients:', baseIngredients);
                    return baseIngredients.map((ingredient, index) => {
                      console.log('mapping base ingredient:', ingredient, 'index:', index);
                      return (
                        <div key={index} className={`ingredient-item base-ingredient ${
                          removedIngredients.includes(ingredient) ? 'removed' : ''
                        }`}>
                          <span className="ingredient-name">{ingredient}</span>
                          <button 
                            className="remove-ingredient-btn"
                            onClick={() => toggleRemovedIngredient(ingredient)}
                            title={removedIngredients.includes(ingredient) ? 'Remettre' : 'Supprimer'}
                          >
                            {removedIngredients.includes(ingredient) ? <Plus size={16} /> : <Minus size={16} />}
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Ingrédients ajoutés */}
              {addedIngredients.length > 0 && (
                <div className="added-ingredients-section">
                  <h3>Ingrédients ajoutés</h3>
                  <div className="ingredients-list">
                    {(() => {
                      console.log('addedIngredients for mapping:', addedIngredients);
                      return addedIngredients.map((ingredientWithQuantity) => {
                        console.log('mapping added ingredient:', ingredientWithQuantity);
                        const { ingredient, quantity } = ingredientWithQuantity;
                        return (
                          <div key={ingredient.id_ingredients} className="ingredient-item added-ingredient">
                            <span className="ingredient-name">{ingredient.nom_ingredients}</span>
                            <div className="ingredient-controls">
                              <button 
                                className="quantity-btn decrease-btn"
                                onClick={() => decreaseIngredientQuantity(ingredient.id_ingredients)}
                                title="Diminuer la quantité"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="ingredient-quantity">{quantity}</span>
                              <button 
                                className="quantity-btn increase-btn"
                                onClick={() => increaseIngredientQuantity(ingredient.id_ingredients)}
                                title="Augmenter la quantité"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="ingredient-price">+{(parseFloat(ingredient.prix_ingredients) * quantity).toFixed(2)}€</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Ingrédients disponibles */}
              <div className="available-ingredients-section">
                <h3>Ajouter des ingrédients</h3>
                {customizationLoading ? (
                  <div className="loading-ingredients">
                    <p>Chargement des ingrédients...</p>
                  </div>
                ) : (
                  <div className="ingredients-grid">
                    {(() => {
                      console.log('availableIngredients:', availableIngredients);
                      console.log('addedIngredients:', addedIngredients);
                      // Filtrer les ingrédients déjà ajoutés
                      const filteredIngredients = availableIngredients.filter(ingredient => 
                        !addedIngredients.some(added => added.ingredient.id_ingredients === ingredient.id_ingredients)
                      );
                      return filteredIngredients.map((ingredient) => {
                        console.log('mapping ingredient:', ingredient);
                        return (
                          <div key={ingredient.id_ingredients} className="available-ingredient">
                            <span className="ingredient-name">{ingredient.nom_ingredients}</span>
                            <span className="ingredient-price">+{ingredient.prix_ingredients}€</span>
                            <button 
                              className="add-ingredient-btn"
                              onClick={() => addIngredient(ingredient)}
                              title="Ajouter"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="customize-footer">
              <div className="final-price">
                <strong>Prix final: {calculateCustomPrice().toFixed(2)}€</strong>
              </div>
              <div className="customize-actions">
                <button className="btn-cancel" onClick={closeCustomizeModal}>
                  Annuler
                </button>
                <button className="btn-add-to-cart" onClick={addCustomizedPizzaToCart}>
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;