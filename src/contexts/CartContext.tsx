// ========================================
// CONTEXTE DU PANIER - GESTION D'ÉTAT GLOBAL
// ========================================

/**
 * Ce fichier implémente le "Context" React pour gérer le panier d'achat.
 * 
 * Qu'est-ce qu'un Context ?
 * Imaginez une boîte magique qui peut être ouverte par n'importe quel composant
 * de l'application pour y déposer ou récupérer des informations.
 * 
 * Pourquoi utiliser un Context ?
 * Sans Context, pour partager le panier entre Header (afficher le nombre d'items)
 * et Menu (ajouter des pizzas), il faudrait faire passer les données de composant
 * en composant. Avec Context, tous peuvent accéder directement au panier !
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// ========================================
// TYPES TYPESCRIPT - DÉFINITION DES STRUCTURES DE DONNÉES
// ========================================

/**
 * Interface Ingredient - Structure d'un ingrédient
 */
export interface Ingredient {
  id_ingredients: number;
  nom_ingredients: string;
  prix_ingredients: string;
}

/**
 * Interface IngredientWithQuantity - Ingrédient avec quantité
 */
export interface IngredientWithQuantity {
  ingredient: Ingredient;
  quantity: number;
}

/**
 * Interface CartItem - Définit la structure d'un article dans le panier
 * 
 * Une interface en TypeScript est comme un "contrat" qui dit :
 * "Tout objet CartItem DOIT avoir ces propriétés avec ces types"
 */
export interface CartItem {
  id: string;              // Identifiant unique de l'élément dans le panier
  nom_pizza: string;       // Nom de la pizza
  prix_pizza: number;      // Prix unitaire de la pizza
  quantity: number;        // Quantité commandée
  ingredients?: string;    // Ingrédients supplémentaires (optionnel avec ?)
  base?: string;          // Type de base (optionnel avec ?)
  image_url?: string;     // URL de l'image (optionnel avec ?)
  addedIngredients?: IngredientWithQuantity[];  // Ingrédients ajoutés pour pizzas personnalisées
  removedIngredients?: string[];                // Ingrédients supprimés pour pizzas personnalisées
}

/**
 * Interface CartContextType - Définit toutes les fonctions et données
 * que le Context va fournir aux composants
 */
interface CartContextType {
  cartItems: CartItem[];                              // Liste des articles dans le panier
  addToCart: (pizza: any) => void;                   // Fonction pour ajouter une pizza
  removeFromCart: (id: string) => void;              // Fonction pour supprimer une pizza
  updateQuantity: (id: string, quantity: number) => void; // Fonction pour changer la quantité
  clearCart: () => void;                             // Fonction pour vider le panier
  getTotalPrice: () => number;                       // Fonction pour calculer le prix total
  getTotalItems: () => number;                       // Fonction pour compter les articles
}

// ========================================
// CRÉATION DU CONTEXT
// ========================================

/**
 * Création du Context avec createContext()
 * 
 * createContext() crée la "boîte magique" mentionnée plus haut.
 * On lui donne une valeur par défaut (undefined ici).
 * Le type <CartContextType | undefined> dit que le Context peut contenir
 * soit nos données de panier, soit undefined (si pas encore initialisé).
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

// ========================================
// HOOK PERSONNALISÉ - useCart
// ========================================

/**
 * Hook personnalisé useCart()
 * 
 * Un hook personnalisé est une fonction qui utilise d'autres hooks React.
 * Celui-ci simplifie l'utilisation du Context dans les composants.
 * 
 * Au lieu d'écrire :
 * const context = useContext(CartContext);
 * if (!context) throw new Error(...);
 * 
 * On peut juste écrire :
 * const { addToCart, cartItems } = useCart();
 */
export const useCart = () => {
  // useContext() récupère les données du Context
  const context = useContext(CartContext);
  
  // Vérification de sécurité : si le Context n'existe pas, c'est une erreur
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  // Retourne les données et fonctions du panier
  return context;
};

// ========================================
// PROVIDER - FOURNISSEUR DU CONTEXT
// ========================================

/**
 * Interface pour les props du CartProvider
 * ReactNode = n'importe quel élément React (composant, texte, etc.)
 */
interface CartProviderProps {
  children: ReactNode;  // Les composants enfants qui auront accès au panier
}

/**
 * CartProvider - Le composant qui "fournit" le panier à ses enfants
 * 
 * Ce composant enveloppe d'autres composants et leur donne accès au panier.
 * C'est comme un parent qui partage ses jouets avec tous ses enfants.
 * 
 * React.FC = React Functional Component (composant fonctionnel React)
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  
  // ========================================
  // STATE - ÉTAT LOCAL DU PANIER
  // ========================================
  
  /**
   * useState() crée une variable d'état qui peut changer
   * 
   * cartItems : la variable qui contient les articles du panier
   * setCartItems : la fonction pour modifier cartItems
   * useState<CartItem[]>([]) : initialise avec un tableau vide
   */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ========================================
  // FONCTIONS DE GESTION DU PANIER
  // ========================================
  
  /**
   * Fonction helper pour comparer les personnalisations de deux pizzas
   * Retourne true si les personnalisations sont identiques
   */
  const areCustomizationsEqual = (item1: CartItem, item2: any) => {
    // Comparer les ingrédients supprimés
    const removed1 = item1.removedIngredients || [];
    const removed2 = item2.removedIngredients || [];
    
    if (removed1.length !== removed2.length) return false;
    if (!removed1.every(ing => removed2.includes(ing))) return false;
    
    // Comparer les ingrédients ajoutés
    const added1 = item1.addedIngredients || [];
    const added2 = item2.addedIngredients || [];
    
    if (added1.length !== added2.length) return false;
    
    // Vérifier chaque ingrédient ajouté (nom et quantité)
    for (const ing1 of added1) {
      const ing2 = added2.find(ing => ing.ingredient.nom_ingredients === ing1.ingredient.nom_ingredients);
      if (!ing2 || ing2.quantity !== ing1.quantity) return false;
    }
    
    return true;
  };

  /**
   * Fonction addToCart - Ajouter une pizza au panier
   * 
   * Cette fonction vérifie si la pizza existe déjà dans le panier avec les MÊMES personnalisations :
   * - Si oui : augmente la quantité de 1
   * - Si non : ajoute la pizza comme nouvel élément
   */
  const addToCart = (pizza: any) => {
    // setCartItems avec une fonction permet d'accéder à l'état précédent
    setCartItems(prevItems => {
      
      // find() cherche si la pizza existe déjà avec les mêmes personnalisations
      const existingItem = prevItems.find(item => 
        item.id === pizza.id_pizza && areCustomizationsEqual(item, pizza)
      );
      
      if (existingItem) {
        // Si la pizza existe déjà avec les mêmes personnalisations, on augmente sa quantité
        // map() crée un nouveau tableau en transformant chaque élément
        return prevItems.map(item =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1 }  // Spread operator + modification
            : item  // Garde l'item tel quel
        );
      } else {
        // Si la pizza n'existe pas ou a des personnalisations différentes, on l'ajoute au panier
        // Générer un ID unique pour chaque élément du panier (combinaison de l'ID pizza + timestamp)
        const uniqueId = `${pizza.id_pizza}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newItem: CartItem = {
          id: uniqueId,  // ID unique pour cet élément spécifique du panier
          nom_pizza: pizza.nom_pizza,
          prix_pizza: parseFloat(pizza.prix_pizza) || 0,  // Conversion en nombre
          quantity: 1,
          ingredients: pizza.ingredients,
          base: pizza.base,
          image_url: pizza.image_url,  // Ajout de l'URL de l'image
          // Copier les propriétés de personnalisation si elles existent
          addedIngredients: pizza.addedIngredients || undefined,
          removedIngredients: pizza.removedIngredients || undefined
        };
        // Spread operator pour créer un nouveau tableau avec l'item ajouté
        return [...prevItems, newItem];
      }
    });
  };

  /**
   * Fonction removeFromCart - Supprimer une pizza du panier
   * 
   * filter() crée un nouveau tableau en gardant seulement les éléments
   * qui respectent la condition (ici : id différent de celui à supprimer)
   */
  const removeFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  /**
   * Fonction updateQuantity - Modifier la quantité d'une pizza
   * 
   * Si la quantité devient 0 ou négative, on supprime l'article
   * Sinon, on met à jour la quantité
   */
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);  // Supprimer si quantité <= 0
      return;
    }
    
    // map() pour trouver et modifier l'item avec l'id correspondant
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  /**
   * Fonction clearCart - Vider complètement le panier
   * 
   * Remet cartItems à un tableau vide []
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Fonction getTotalPrice - Calculer le prix total du panier
   * 
   * reduce() "réduit" un tableau à une seule valeur
   * Ici : additionne (prix × quantité) pour chaque article
   */
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.prix_pizza * item.quantity), 0);
  };

  /**
   * Fonction getTotalItems - Compter le nombre total d'articles
   * 
   * reduce() pour additionner toutes les quantités
   */
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // ========================================
  // ASSEMBLAGE ET FOURNITURE DU CONTEXT
  // ========================================
  
  /**
   * Objet value - Rassemble toutes les données et fonctions du panier
   * 
   * Cet objet contient tout ce que les composants enfants pourront utiliser
   * quand ils appelleront useCart()
   */
  const value: CartContextType = {
    cartItems,        // Les articles du panier
    addToCart,        // Ajouter au panier
    removeFromCart,   // Supprimer du panier
    updateQuantity,   // Modifier la quantité
    clearCart,        // Vider le panier
    getTotalPrice,    // Calculer le prix total
    getTotalItems     // Compter les articles
  };

  /**
   * Rendu du Provider
   * 
   * CartContext.Provider "fournit" les données à tous ses enfants
   * Tous les composants à l'intérieur pourront utiliser useCart()
   * 
   * {children} affiche tous les composants enfants passés en props
   */
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * RÉSUMÉ DU FONCTIONNEMENT :
 * 
 * 1. CartProvider enveloppe l'application dans App.tsx
 * 2. Tous les composants à l'intérieur peuvent utiliser useCart()
 * 3. useCart() donne accès aux données et fonctions du panier
 * 4. Quand un composant modifie le panier, tous les autres se mettent à jour automatiquement
 * 
 * Exemple d'utilisation dans un composant :
 * 
 * function Menu() {
 *   const { addToCart, cartItems } = useCart();
 *   
 *   const handleAddPizza = (pizza) => {
 *     addToCart(pizza);  // Ajoute la pizza au panier
 *   };
 *   
 *   return (
 *     <div>
 *       <p>Panier : {cartItems.length} articles</p>
 *       <button onClick={() => handleAddPizza(maPizza)}>Ajouter</button>
 *     </div>
 *   );
 * }
 */