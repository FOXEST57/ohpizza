import React from "react";
import { Link } from "react-router-dom";
import { useCart } from '../contexts/CartContext';
import "./Cart.css";

const Cart: React.FC = () => {
    const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();

    const handleCheckout = () => {
        // Ici on intégrerait PayPal
        alert("Redirection vers PayPal pour le paiement...");
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart">
                <div className="container">
                    <header className="cart-header">
                        <h1>Votre Panier</h1>
                    </header>

                    <div className="cart-content">
                        <div className="empty-cart">
                            <div className="empty-cart-icon">🛒</div>
                            <h2>Votre panier est vide</h2>
                            <p>
                                Ajoutez des pizzas délicieuses à votre panier
                                pour commencer votre commande.
                            </p>
                            <Link to="/menu" className="btn btn-discover-menu">
                                Découvrir notre menu
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart">
            <div className="container">
                <header className="cart-header">
                    <h1>Votre Panier</h1>
                    <p>
                        {cartItems.length} article
                        {cartItems.length > 1 ? "s" : ""} dans votre panier
                    </p>
                </header>

                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="item-image">
                                    <div className="placeholder-image">
                                        🍕
                                    </div>
                                </div>

                                <div className="item-details">
                                    <h3>{item.nom_pizza}</h3>
                                    <p className="item-ingredients">
                                        {item.ingredients}
                                    </p>
                                    <p className="item-price">
                                        {item.prix_pizza.toFixed(2)}€
                                    </p>
                                </div>

                                <div className="item-controls">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity - 1
                                                )
                                            }
                                            className="quantity-btn"
                                        >
                                            -
                                        </button>
                                        <span className="quantity">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity + 1
                                                )
                                            }
                                            className="quantity-btn"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="remove-btn"
                                    >
                                        Supprimer
                                    </button>
                                </div>

                                <div className="item-total">
                                    {(item.prix_pizza * item.quantity).toFixed(
                                        2
                                    )}
                                    €
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-card">
                            <h3>Résumé de la commande</h3>

                            <div className="summary-line">
                                <span>Sous-total:</span>
                                <span>{getTotalPrice().toFixed(2)}€</span>
                            </div>

                            <div className="summary-line">
                                <span>Livraison:</span>
                                <span>Gratuite</span>
                            </div>

                            <div className="summary-line total">
                                <span>Total:</span>
                                <span>{getTotalPrice().toFixed(2)}€</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn btn-discover-menu btn-large"
                            >
                                Payer avec PayPal
                            </button>

                            <Link
                                to="/menu"
                                className="btn btn-secondary btn-large"
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
