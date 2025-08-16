/**
 * ========================================
 * COMPOSANT FOOTER - PIED DE PAGE
 * ========================================
 * 
 * Ce composant affiche :
 * - Les horaires d'ouverture (récupérés depuis l'API)
 * - Les informations de livraison
 * - Les moyens de paiement
 * - Les informations de contact
 * 
 * CONCEPTS DÉMONTRÉS :
 * - Appel API avec fetch()
 * - Gestion d'état avec useState
 * - Effet de bord avec useEffect
 * - Interface TypeScript
 * - Rendu conditionnel complexe
 * - Formatage de données
 */

import React, { useEffect, useState } from "react";
import "./Footer.css";

// ========================================
// INTERFACE TYPESCRIPT
// ========================================

/**
 * Interface pour définir la structure d'un horaire
 * 
 * QU'EST-CE QU'UNE INTERFACE ?
 * C'est un "contrat" qui définit la forme d'un objet.
 * TypeScript vérifie que nos données respectent cette structure.
 * 
 * AVANTAGES :
 * - Détection d'erreurs à l'écriture du code
 * - Autocomplétion dans l'éditeur
 * - Documentation du code
 * 
 * string | null : signifie "chaîne de caractères OU null"
 */
interface Horaire {
    id_horaire: number;              // ID unique de l'horaire
    jour: string;                    // Nom du jour ("Lundi", "Mardi", etc.)
    heure_debut_mat: string | null;  // Heure d'ouverture matin (peut être null si fermé)
    heure_fin_mat: string | null;    // Heure de fermeture matin
    heure_debut_ap: string | null;   // Heure d'ouverture après-midi
    heure_fin_ap: string | null;     // Heure de fermeture après-midi
}

// ========================================
// COMPOSANT FOOTER
// ========================================

/**
 * Composant fonctionnel Footer
 * React.FC = React Functional Component (type TypeScript)
 */
const Footer: React.FC = () => {
    // ========================================
    // ÉTAT LOCAL DU COMPOSANT
    // ========================================
    
    /**
     * État pour stocker les horaires récupérés de l'API
     * 
     * useState<Horaire[]> :
     * - Horaire[] : tableau d'objets de type Horaire
     * - [] : valeur initiale (tableau vide)
     * 
     * horaires : valeur actuelle
     * setHoraires : fonction pour modifier la valeur
     */
    const [horaires, setHoraires] = useState<Horaire[]>([]);

    // ========================================
    // FONCTIONS UTILITAIRES
    // ========================================
    
    /**
     * Fonction pour formater l'heure
     * 
     * PROBLÈME À RÉSOUDRE :
     * La base de données stocke les heures au format "HH:MM:SS" (ex: "09:30:00")
     * Mais on veut afficher seulement "HH:MM" (ex: "09:30")
     * 
     * PARAMÈTRES :
     * - time: string | null → peut être une chaîne ou null
     * 
     * RETOUR :
     * - string → toujours une chaîne (vide si time est null)
     */
    const formatTime = (time: string | null): string => {
        /**
         * Vérification : si time est null ou undefined, retourner chaîne vide
         */
        if (!time) return "";
        
        /**
         * substring(0, 5) : extrait les 5 premiers caractères
         * "09:30:00" → "09:30"
         * "14:45:00" → "14:45"
         */
        return time.substring(0, 5);
    };

    // ========================================
    // EFFET DE BORD - CHARGEMENT DES DONNÉES
    // ========================================
    
    /**
     * useEffect pour charger les horaires au montage du composant
     * 
     * QU'EST-CE QU'UN EFFET DE BORD ?
     * Une action qui sort du cadre normal du rendu :
     * - Appel API
     * - Modification du DOM
     * - Abonnement à des événements
     * 
     * SYNTAXE :
     * useEffect(fonction, dépendances)
     * - fonction : ce qui s'exécute
     * - [] : tableau vide = s'exécute seulement au montage
     */
    useEffect(() => {
        /**
         * Appel API avec fetch()
         * 
         * POURQUOI ?t=${Date.now()} ?
         * Date.now() génère un timestamp unique à chaque appel.
         * Cela évite la mise en cache du navigateur et garantit
         * que les données sont toujours fraîches.
         * 
         * Exemple d'URL générée :
         * http://localhost:5000/api/horaires?t=1703123456789
         */
        fetch(`http://localhost:5000/api/horaires?t=${Date.now()}`)
            /**
             * .then() : que faire quand la requête réussit
             * response.json() : convertit la réponse en objet JavaScript
             */
            .then((response) => response.json())
            /**
             * Traitement des données reçues
             */
            .then((data) => {
                /**
                 * Vérification de la structure de la réponse
                 * 
                 * L'API renvoie :
                 * {
                 *   success: true,
                 *   data: [...], // tableau des horaires
                 *   count: 7
                 * }
                 */
                if (data.success && data.data) {
                    /**
                     * Mise à jour de l'état avec les horaires reçus
                     */
                    setHoraires(data.data);
                }
            })
            /**
             * Gestion des erreurs
             * .catch() : que faire si quelque chose se passe mal
             */
            .catch((error) => {
                console.error("Erreur lors du chargement des horaires:", error);
            });
    }, []); // [] = pas de dépendances, s'exécute seulement au montage

    return (
        <footer>
            <section className="info">
                <div>
                    <h3>Heures d'ouverture</h3>
                    <table>
                        <tbody>
                            {horaires.length > 0 &&
                                horaires.map((ligne, index) => {
                                    const isFerme =
                                        !ligne.heure_debut_mat &&
                                        !ligne.heure_fin_mat &&
                                        !ligne.heure_debut_ap &&
                                        !ligne.heure_fin_ap;
                                    const matinFerme =
                                        !ligne.heure_debut_mat &&
                                        !ligne.heure_fin_mat;
                                    const apremFerme =
                                        !ligne.heure_debut_ap &&
                                        !ligne.heure_fin_ap;

                                    return (
                                        <tr key={ligne.id_horaire || index}>
                                            <td>{ligne.jour}</td>
                                            <td style={{ width: "25px" }}></td>
                                            {isFerme ? (
                                                <td
                                                    colSpan={7}
                                                    style={{
                                                        textAlign: "center",
                                                        fontStyle: "italic",
                                                    }}
                                                >
                                                    Fermé
                                                </td>
                                            ) : (
                                                <>
                                                    {matinFerme ? (
                                                        <>
                                                            <td
                                                                style={{
                                                                    textAlign:
                                                                        "center",
                                                                    fontStyle:
                                                                        "italic",
                                                                }}
                                                            >
                                                                Fermé
                                                            </td>
                                                            <td></td>
                                                            <td></td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                {formatTime(
                                                                    ligne.heure_debut_mat
                                                                )}
                                                            </td>
                                                            <td>-</td>
                                                            <td>
                                                                {formatTime(
                                                                    ligne.heure_fin_mat
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td
                                                        style={{
                                                            width: "25px",
                                                        }}
                                                    ></td>
                                                    {apremFerme ? (
                                                        <>
                                                            <td
                                                                style={{
                                                                    textAlign:
                                                                        "center",
                                                                    fontStyle:
                                                                        "italic",
                                                                }}
                                                            >
                                                                Fermé
                                                            </td>
                                                            <td></td>
                                                            <td></td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                {formatTime(
                                                                    ligne.heure_debut_ap
                                                                )}
                                                            </td>
                                                            <td>-</td>
                                                            <td>
                                                                {formatTime(
                                                                    ligne.heure_fin_ap
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                <div className="livraison">
                    <h3>Livraison gratuite à domicile</h3>
                    <p>
                        Nous livrons vos pizzas jusqu'à 6km autour de notre
                        restaurant et pour un minimum de 20€ de commande.
                    </p>
                    <div className="camion">
                        <img src="/images/camion livraison.png" alt="" />
                    </div>
                </div>

                <div className="cb">
                    <h3>Commande et paiement en ligne securisé</h3>
                    <p>
                        Vos règlements en ligne sont sécurisé par STRIPE et
                        PayPal.
                    </p>
                    <div className="cbimg">
                        <img src="/images/logo paiement.png" alt="" />
                    </div>
                </div>
            </section>

            <section className="contact">
                <a
                    href="https://www.google.com/maps/dir/?api=1&destination=28+Rue+des+Garennes,+57155+Marly,+France"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src="/images/alert_5665892.png" alt="adresse" />
                    28 Rue des Garennes, 57155 Marly
                </a>
                <a href="tel:0387523414">
                    <img src="/images/telephone_724664.png" alt="telephone" />
                    03 87 52 34 14
                </a>
                <a href="mailto:ohpizza@gmail.com">
                    <img src="/images/attach_10270667.png" alt="email" />
                    ohpizza@gmail.com
                </a>
                <a
                    href="https://www.facebook.com/p/OhPizza-Marly-100070062456813/?locale=fr_FR"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src="/images/5968764.png" alt="facebook" /> facebook
                </a>
            </section>

            <section className="mention">
                <a href="#"> Copyright 2024 Modelias Tous droits reservés</a>
                <a href="#">Mentions légales</a>
            </section>
        </footer>
    );
};

export default Footer;
