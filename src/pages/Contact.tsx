import React, { useState, useEffect } from 'react';
import './Contact.css';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface Horaire {
    id_horaire: number;
    jour: string;
    heure_debut_mat: string | null;
    heure_fin_mat: string | null;
    heure_debut_ap: string | null;
    heure_fin_ap: string | null;
}

const Contact: React.FC = () => {
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: ''
  });

  // Fonction pour formater l'heure (supprimer les secondes)
  const formatTime = (time: string | null): string => {
    if (!time) return "";
    // Extraire seulement HH:MM de HH:MM:SS
    return time.substring(0, 5);
  };

  useEffect(() => {
    fetch(`http://localhost:5000/api/horaires?t=${Date.now()}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.data) {
          setHoraires(data.data);
        }
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des horaires:", error);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous pouvez ajouter la logique d'envoi du formulaire
    console.log('Formulaire soumis:', formData);
    alert('Votre message a été envoyé ! Nous vous répondrons dans les plus brefs délais.');
    setFormData({ nom: '', email: '', telephone: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Nous Trouver</h1>
        <p>Venez découvrir nos délicieuses pizzas dans notre restaurant ou contactez-nous !</p>
      </div>

      <div className="contact-content">
        <div className="map-section">
          <h2>Notre Localisation</h2>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps?q=28+Rue+des+Garennes,+57155+Marly,+France&output=embed&z=16"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation Oh'Pizza - 28 Rue des Garennes, 57155 Marly"
            ></iframe>
          </div>
        </div>

        <div className="contact-info-section">
          <div className="contact-card">
            <h2>Nos Coordonnées</h2>
            <div className="contact-details">
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <div>
                  <h3>Adresse</h3>
                  <p>28 Rue des Garennes<br />57155 Marly, France</p>
                </div>
              </div>
              
              <div className="contact-item">
                <Phone className="contact-icon" />
                <div>
                  <h3>Téléphone</h3>
                  <p><a href="tel:0387523414" style={{color: 'inherit', textDecoration: 'none'}}>03 87 52 34 14</a></p>
                </div>
              </div>
              
              <div className="contact-item">
                <Mail className="contact-icon" />
                <div>
                  <h3>Email</h3>
                  <p><a href="mailto:ohpizza@gmail.com" style={{color: 'inherit', textDecoration: 'none'}}>ohpizza@gmail.com</a></p>
                </div>
              </div>
            </div>
          </div>

          <div className="hours-card">
            <h2>Horaires d'Ouverture</h2>
            <div className="hours-list">
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

                  let timeDisplay = "";
                  if (isFerme) {
                    timeDisplay = "Fermé";
                  } else {
                    const matinText = matinFerme 
                      ? "" 
                      : `${formatTime(ligne.heure_debut_mat)} - ${formatTime(ligne.heure_fin_mat)}`;
                    const apremText = apremFerme 
                      ? "" 
                      : `${formatTime(ligne.heure_debut_ap)} - ${formatTime(ligne.heure_fin_ap)}`;
                    
                    if (matinText && apremText) {
                      timeDisplay = `${matinText} / ${apremText}`;
                    } else if (matinText) {
                      timeDisplay = matinText;
                    } else if (apremText) {
                      timeDisplay = apremText;
                    }
                  }

                  return (
                    <div key={ligne.id_horaire || index} className="hour-item">
                      <span className="day">{ligne.jour}</span>
                      <span className="time" style={isFerme ? {fontStyle: 'italic', opacity: 0.7} : {}}>
                        {timeDisplay}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Nous Contacter</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row-three">
              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre nom"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="telephone">Téléphone</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  placeholder="01 23 45 67 89"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="votre.email@exemple.com"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                placeholder="Votre message..."
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn">
              Envoyer le Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;