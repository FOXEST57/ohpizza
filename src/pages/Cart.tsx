import React from "react";
import { Link } from "react-router-dom";
import { useCart } from '../contexts/CartContext';
import "./panier.css";

const Cart: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();

    const handleCheckout = () => {
        // Ici on intégrerait PayPal
        alert("Redirection vers PayPal pour le paiement...");
    };

    if (cartItems.length === 0) {
        return (
            <div className="panier-container">
                <div className="panier-wrapper">
                    <header className="panier-header">
                        <h1>Votre Panier</h1>
                    </header>

                    <div className="panier-content">
                        <div className="panier-empty">
                            <div className="panier-empty-icon">🛒</div>
                            <h2>Votre panier est vide</h2>
                            <p>
                                Ajoutez des pizzas délicieuses à votre panier
                                pour commencer votre commande.
                            </p>
                            <Link to="/menu" className="panier-btn panier-btn-primary">
                                Découvrir notre menu
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panier-container">
            <div className="panier-wrapper">
                <header className="panier-header">
                    <h1>Votre Panier</h1>
                    <p>
                        {cartItems.length} article
                        {cartItems.length > 1 ? "s" : ""} dans votre panier
                    </p>
                </header>

                <div className="panier-content">
                    <div className="panier-items">
                        {cartItems.map((item) => (
                            <div key={item.id} className="panier-item">
                                <div className="panier-item-image">
                                    {item.image_url ? (
                                        <img 
                                            src={item.image_url} 
                                            alt={item.nom_pizza}
                                            className="panier-pizza-image"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = '<div class="panier-placeholder-image">🍕</div>';
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="panier-placeholder-image">
                                            🍕
                                        </div>
                                    )}
                                </div>

                                <div className="panier-item-details">
                                    <h3>{item.nom_pizza}</h3>
                                    {/* Affichage différent pour les pizzas personnalisées */}
                                    {(item as any).addedIngredients || (item as any).removedIngredients ? (
                                        <div className="panier-customized-ingredients">
                                            {/* Ingrédients de base supprimés (en rouge barré) */}
                                            {(item as any).removedIngredients && (item as any).removedIngredients.length > 0 && (
                                                <div className="panier-removed-ingredients">
                                                    {(item as any).removedIngredients.map((ingredient: string, index: number) => (
                                                        <span key={index} style={{color: 'red', textDecoration: 'line-through', marginRight: '8px'}}>
                                                            {ingredient}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Ingrédients ajoutés (en vert avec quantité) */}
                                            {(item as any).addedIngredients && (item as any).addedIngredients.length > 0 && (
                                                <div className="panier-added-ingredients">
                                                    {(item as any).addedIngredients.map((ing: any, index: number) => (
                                                        <span key={index} style={{color: 'green', marginRight: '8px'}}>
                                                            {ing.quantity}x {ing.ingredient.nom_ingredients}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {/* Ingrédients de base restants (normaux) */}
                                            {item.ingredients && (
                                                <div className="panier-base-ingredients">
                                                    {item.ingredients.split(', ').filter((ingredient: string) => 
                                                        !(item as any).removedIngredients || !(item as any).removedIngredients.includes(ingredient)
                                                    ).map((ingredient: string, index: number) => (
                                                        <span key={index} style={{marginRight: '8px'}}>
                                                            {ingredient}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Affichage normal pour les pizzas non personnalisées */
                                        <p className="panier-item-ingredients">
                                            {item.ingredients}
                                        </p>
                                    )}
                                    <p className="panier-item-price">
                                        {item.prix_pizza.toFixed(2)}€
                                    </p>
                                </div>

                                <div className="panier-item-controls">
                                    <div className="panier-quantity-controls">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity - 1
                                                )
                                            }
                                            className="panier-quantity-btn"
                                        >
                                            -
                                        </button>
                                        <span className="panier-quantity">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity + 1
                                                )
                                            }
                                            className="panier-quantity-btn"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="panier-remove-btn"
                                    >
                                        Supprimer
                                    </button>
                                </div>

                                <div className="panier-item-total">
                                    {(item.prix_pizza * item.quantity).toFixed(
                                        2
                                    )}
                                    €
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="panier-summary">
                        <div className="panier-summary-card">
                            <h3>Résumé de la commande</h3>

                            <div className="panier-order-details">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="panier-order-item">
                                        <div className="panier-order-item-info">
                                            <span className="panier-order-item-name">{item.nom_pizza}</span>
                                            <span className="panier-order-item-price">{item.prix_pizza.toFixed(2)}€</span>
                                        </div>
                                        <div className="panier-order-item-quantity">
                                            <span>Quantité: {item.quantity}</span>
                                            <span className="panier-order-item-subtotal">{(item.prix_pizza * item.quantity).toFixed(2)}€</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="panier-summary-divider"></div>

                            <div className="panier-summary-line">
                                <span>Sous-total:</span>
                                <span>{getTotalPrice().toFixed(2)}€</span>
                            </div>

                            <div className="panier-summary-line">
                                <span>Livraison:</span>
                                <span>Gratuite</span>
                            </div>

                            <div className="panier-summary-line panier-total">
                                <span>Total:</span>
                                <span>{getTotalPrice().toFixed(2)}€</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="panier-btn panier-btn-primary panier-btn-large"
                            >
                                Payer avec PayPal
                            </button>

                            <Link
                                to="/menu"
                                className="panier-btn panier-btn-secondary panier-btn-large"
                            >
                                Continuer mes achats
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
