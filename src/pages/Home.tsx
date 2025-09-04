import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, Mail, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './Home.css';

interface Horaire {
  id_horaire: number;
  jour: string;
  heure_debut_mat: string | null;
  heure_fin_mat: string | null;
  heure_debut_ap: string | null;
  heure_fin_ap: string | null;
}

const Home: React.FC = () => {
  const [avisRecents, setAvisRecents] = useState([]);
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [showNotification, setShowNotification] = useState('');
  const { addToCart } = useCart();

  // Fonction pour formater l'heure (supprimer les secondes)
  const formatTime = (time: string | null): string => {
    if (!time) return '';
    // Extraire seulement HH:MM de HH:MM:SS
    return time.substring(0, 5);
  };

  // Données des pizzas populaires avec toutes les propriétés requises
  const pizzasPopulaires = [
    {
      id_pizza: 1,
      nom_pizza: "Pizza Margherita",
      prix_pizza: 12.90,
      ingredients: "Tomate, mozzarella, basilic frais",
      base: "Pâte traditionnelle",
      image_url: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20margherita%20pizza%20with%20fresh%20basil%20and%20mozzarella%20cheese%20on%20wooden%20table%20restaurant%20style&image_size=square"
    },
    {
      id_pizza: 2,
      nom_pizza: "Pizza Pepperoni",
      prix_pizza: 14.90,
      ingredients: "Tomate, mozzarella, pepperoni épicé",
      base: "Pâte traditionnelle",
      image_url: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pepperoni%20pizza%20with%20spicy%20salami%20and%20cheese%20on%20wooden%20table%20restaurant%20style&image_size=square"
    },
    {
      id_pizza: 3,
      nom_pizza: "Pizza Quattro Formaggi",
      prix_pizza: 16.90,
      ingredients: "Mozzarella, gorgonzola, parmesan, chèvre",
      base: "Pâte traditionnelle",
      image_url: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=quattro%20formaggi%20pizza%20with%20four%20different%20cheeses%20on%20wooden%20table%20restaurant%20style&image_size=square"
    }
  ];

  useEffect(() => {
    // Récupération de tous les avis
    fetch('http://localhost:5000/api/avis')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvisRecents(data); // Utiliser tous les avis au lieu de seulement les 3 premiers
          // Calcul de la note moyenne
          if (data.length > 0) {
            const moyenne = data.reduce((acc, avis) => acc + avis.note, 0) / data.length;
            setNoteMoyenne(Math.round(moyenne * 10) / 10);
          }
        }
      })
      .catch(err => console.error('Erreur avis:', err));

    // Récupération des horaires
    fetch(`http://localhost:5000/api/horaires?t=${Date.now()}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data) {
          setHoraires(data.data);
        }
      })
      .catch(error => {
        console.error('Erreur lors du chargement des horaires:', error);
      });
  }, []);

  // Carrousel avec animation CSS continue - plus besoin de logique JavaScript

  const renderStars = (note) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < note ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Fonction pour ajouter une pizza au panier
  const handleAddToCart = (pizza: any) => {
    addToCart(pizza);
    setShowNotification(pizza.nom_pizza);
    setTimeout(() => setShowNotification(''), 3000);
  };



  return (
    <div className="home">
      {/* Section Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="phone-header">
            <Phone className="w-6 h-6" />
            <a href="tel:0387523414" className="tel tel-clickable">03 87 52 34 14</a>
          </div>
          <h1 className="hero-title">Bienvenue chez Oh'Pizza</h1>
          <p className="hero-subtitle">L'Art de la Pizza Artisanale, Directement chez Vous</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn-discover-menu">
              Découvrir notre Menu
            </Link>
            <Link to="/menu" className="btn-secondary">
              Commander Maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Section Méthodes de commande */}
      <section className="clipart">
        <div className="methode">
          <Link to="/menu?type=livraison" className="methodea">
            <img src="/images/pizza-4239775_1280 (1).png" alt="Livraison" />
            <p className="methodep">Livraison</p>
          </Link>
        </div>
        <div className="methode">
          <Link to="/menu?type=sur-place" className="methodea">
            <img src="/images/16dcb2173e640c9a992f37157a7d7670 copie.png" alt="Sur place" />
            <p className="methodep">Sur place</p>
          </Link>
        </div>
        <div className="methode">
          <Link to="/menu?type=a-emporter" className="methodea">
            <img src="/images/depositphotos_558847274-stock-illustration-pizza-delivery-courier-box-cartoon copie.png" alt="À emporter" />
            <p className="methodep">À emporter</p>
          </Link>
        </div>
      </section>

      {/* Section Pizzas Populaires */}
      <section className="pizzas-populaires">
        <div className="container">
          <h2 className="section-title">Nos Pizzas Populaires</h2>
          {showNotification && (
            <div className="notification-success">
              <ShoppingCart className="w-5 h-5" />
              {showNotification} ajoutée au panier !
            </div>
          )}
          <div className="pizzas-grid">
            {pizzasPopulaires.map((pizza) => (
              <div key={pizza.id_pizza} className="pizza-card-new">
                <div className="pizza-image-new">
                  <img src={pizza.image_url} alt={pizza.nom_pizza} />
                </div>
                <div className="pizza-info-new">
                  <h3>{pizza.nom_pizza}</h3>
                  <p className="pizza-description-new">{pizza.ingredients}</p>
                  <div className="pizza-price-new">{pizza.prix_pizza.toFixed(2)}€</div>
                  <button 
                    onClick={() => handleAddToCart(pizza)}
                    className="pizza-btn-new"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Commander
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Avis Clients - Carrousel Automatique */}
      <section className="avis-section">
        <div className="container">
          <h2 className="section-title">Ce que disent nos clients</h2>
          <div className="note-moyenne">
            <div className="stars">{renderStars(Math.floor(noteMoyenne))}</div>
            <span className="note-text">{noteMoyenne}/5 ({avisRecents.length} avis)</span>
          </div>
          <div className="avis-carrousel-container">
            <div className="avis-carrousel-wrapper">
              <div className="avis-carrousel-track">
                {/* Dupliquer les avis 4 fois pour un défilement parfaitement fluide */}
                {[...avisRecents, ...avisRecents, ...avisRecents, ...avisRecents].map((avis, index) => (
                  <div key={`${avis.id}-${index}`} className="avis-carrousel-card">
                    <div className="avis-header">
                      <span className="avis-nom">{avis.nom}</span>
                      <div className="avis-stars">{renderStars(avis.note)}</div>
                    </div>
                    <p className="avis-commentaire">{avis.commentaire}</p>
                    {avis.source === 'google' && (
                      <span className="avis-source">Avis Google</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Link to="/avis" className="voir-plus-avis">Voir tous les avis</Link>
        </div>
      </section>

      {/* Section Horaires */}
      <section className="horaires-section">
        <div className="container">
          <h2 className="section-title">
            <Clock className="w-6 h-6" />
            Nos Horaires d'Ouverture
          </h2>
          <div className="horaires-grid">
            <div className="horaires-column">
              {horaires.length > 0 && horaires.slice(0, 3).map((horaire, index) => {
                const isFerme = !horaire.heure_debut_mat && !horaire.heure_fin_mat && !horaire.heure_debut_ap && !horaire.heure_fin_ap;
                const matinFerme = !horaire.heure_debut_mat && !horaire.heure_fin_mat;
                const apremFerme = !horaire.heure_debut_ap && !horaire.heure_fin_ap;
                
                return (
                  <div key={horaire.id_horaire || index} className="horaire-item">
                    <span className="jour">{horaire.jour}</span>
                    <span className="heures">
                      {isFerme ? (
                        'Fermé'
                      ) : (
                        <>
                          {!matinFerme ? (
                            <span className="horaire-periode">
                              {formatTime(horaire.heure_debut_mat)} - {formatTime(horaire.heure_fin_mat)}
                            </span>
                          ) : (
                            <span className="horaire-periode">Fermé</span>
                          )}
                          {(!matinFerme || !apremFerme) && (
                            <span className="horaire-separator"> • </span>
                          )}
                          {!apremFerme ? (
                            <span className="horaire-periode">
                              {formatTime(horaire.heure_debut_ap)} - {formatTime(horaire.heure_fin_ap)}
                            </span>
                          ) : (
                            <span className="horaire-periode">Fermé</span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="horaires-column">
              {horaires.length > 0 && horaires.slice(3).map((horaire, index) => {
                const isFerme = !horaire.heure_debut_mat && !horaire.heure_fin_mat && !horaire.heure_debut_ap && !horaire.heure_fin_ap;
                const matinFerme = !horaire.heure_debut_mat && !horaire.heure_fin_mat;
                const apremFerme = !horaire.heure_debut_ap && !horaire.heure_fin_ap;
                
                return (
                  <div key={horaire.id_horaire || (index + 3)} className="horaire-item">
                    <span className="jour">{horaire.jour}</span>
                    <span className="heures">
                      {isFerme ? (
                        'Fermé'
                      ) : (
                        <>
                          {!matinFerme ? (
                            <span className="horaire-periode">
                              {formatTime(horaire.heure_debut_mat)} - {formatTime(horaire.heure_fin_mat)}
                            </span>
                          ) : (
                            <span className="horaire-periode">Fermé</span>
                          )}
                          {(!matinFerme || !apremFerme) && (
                            <span className="horaire-separator"> • </span>
                          )}
                          {!apremFerme ? (
                            <span className="horaire-periode">
                              {formatTime(horaire.heure_debut_ap)} - {formatTime(horaire.heure_fin_ap)}
                            </span>
                          ) : (
                            <span className="horaire-periode">Fermé</span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section className="contact-section">
        <div className="container">
          <h2 className="section-title">Nous Contacter</h2>
          <div className="contact-grid">
            <a href="https://www.google.com/maps/dir/?api=1&destination=28+Rue+des+Garennes,+57155+Marly,+France" target="_blank" rel="noopener noreferrer" className="contact-item">
              <MapPin className="w-6 h-6" />
              <div>
                <h3>Adresse</h3>
                <p>28 Rue des Garennes<br />57155 Marly</p>
              </div>
            </a>
            <a href="tel:0387523414" className="contact-item">
              <Phone className="w-6 h-6" />
              <div>
                <h3>Téléphone</h3>
                <p>03 87 52 34 14</p>
              </div>
            </a>
            <a href="mailto:ohpizza@gmail.com" className="contact-item">
              <Mail className="w-6 h-6" />
              <div>
                <h3>Email</h3>
                <p>ohpizza@gmail.com</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="bienvenue">
        <div className="carteBienvenue">
          <img className="alignLeft" src="/images/traditonnelle.jpg" alt="" />
          <div className="carte-content">
            <h2>La Tradition Artisanale à Votre Porte</h2>
            <p>Chez Oh'pizza, nous croyons que chaque pizza est une œuvre d'art culinaire.
              Notre pizzeria artisanale vous offre le goût authentique de l'Italie,
              préparé avec passion et des ingrédients de première qualité.
              Nous vous proposons une expérience gastronomique unique, emporter, déguster sur
              place ou livrée directement à votre domicile pour votre plus grand plaisir.</p>
          </div>
        </div>
        <div className="carteBienvenueGauche">
          <img className="alignright" src="/images/ingrdients.jpg" alt="" />
          <div className="carte-content">
            <h2>Nos Ingrédients, Notre Fierté</h2>
            <p>Tous nos ingrédients sont soigneusement sélectionnés pour leur fraîcheur et
              leur qualité. Nos légumes sont croquants et savoureux, nos fromages sont
              fondants et parfumés, et nos viandes sont tendres et savoureuses.
              Nous privilégions les produits locaux et biologiques pour vous garantir des pizzas
              à la fois délicieuses et respectueuses de l'environnement.</p>
          </div>
        </div>
        <div className="carteBienvenue">
          <img className="alignLeft" src="/images/pizza.jpg" alt="" />
          <div className="carte-content">
            <h2>Nos Pizzas, Votre Bonheur</h2>
            <p>Que vous soyez amateur de classiques comme la Margherita ou les incontournables
              Signatures, ou que vous préfériez explorer de nouvelles saveurs avec
              nos créations originales, chaque pizza est préparée à la main avec soin.
              Notre pâte est pétrie quotidiennement et laissée à reposer pour développer
              sa saveur et son moelleux incomparables.</p>
          </div>
        </div>
        <div className="carteBienvenueGauche">
          <img className="alignright" src="/images/livraison.jpg" alt="" />
          <div className="carte-content">
            <h2>La Livraison, Notre Engagement</h2>
            <p>Profitez de la convivialité et de la chaleur de nos pizzas artisanales
              sans quitter le confort de votre maison.
              Nous mettons un point d'honneur à vous livrer rapidement et avec le sourire,
              pour que votre expérience soit parfaite du début à la fin.</p>
          </div>
        </div>
        <div className="carteBienvenue">
          <img className="alignLeft" src="/images/clientss heureux.jpg" alt="" />
          <div className="carte-content">
            <h2>Rejoignez-nous</h2>
            <p>Laissez-vous séduire par la magie Oh'pizza et découvrez pourquoi nos clients
              fidèles ne peuvent plus se passer de nos pizzas.
              Commandez dès maintenant et savourez la différence de l'artisanat à chaque bouchée.
            </p>
          </div>
        </div>
        <p>Oh pizza – L'Art de la Pizza, Directement chez Vous.</p>
      </section>
    </div>
  );
};

export default Home;