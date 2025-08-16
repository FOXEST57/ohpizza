import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Admin.css";

interface Ingredient {
    id_ingredients: number;
    nom_ingredients: string;
    prix_ingredients?: number;
}

interface Pizza {
    id_pizza: number;
    nom_pizza: string;
    prix_pizza: string | number;
    date_creation_pizza?: string;
    id_pizza_categories: number;
    id_pizza_bases?: number;
    image_url?: string;
    category: string;
    base?: string;
    ingredients: string;
}

interface Category {
    id_pizza_categories: number;
    nom_pizza_categories: string;
}

interface Base {
    id_pizza_bases: number;
    nom_pizza_bases: string;
}

interface Horaire {
    id_horaire: number;
    jour: string;
    heure_debut_mat: string;
    heure_fin_mat: string;
    heure_debut_ap: string;
    heure_fin_ap: string;
    created_at?: string;
    updated_at?: string;
}

const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("dashboard");
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [pizzas, setPizzas] = useState<Pizza[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [bases, setBases] = useState<Base[]>([]);
    const [horaires, setHoraires] = useState<Horaire[]>([]);
    const [editingHoraire, setEditingHoraire] = useState<Horaire | null>(null);
    const [newCategory, setNewCategory] = useState("");
    const [newBase, setNewBase] = useState("");
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    );
    const [editingBase, setEditingBase] = useState<Base | null>(null);
    const [pendingReviews, setPendingReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [googleReviews, setGoogleReviews] = useState<any[]>([]);
    const [googleReviewsLoading, setGoogleReviewsLoading] = useState(false);
    const [importData, setImportData] = useState("");
    const [importLoading, setImportLoading] = useState(false);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [editBaseName, setEditBaseName] = useState("");
    const [loading, setLoading] = useState(false);
    const [newIngredient, setNewIngredient] = useState("");
    const [newIngredientPrice, setNewIngredientPrice] = useState<number>(0);
    const [editingIngredient, setEditingIngredient] =
        useState<Ingredient | null>(null);
    const [editIngredientName, setEditIngredientName] = useState("");
    const [editIngredientPrice, setEditIngredientPrice] = useState<number>(0);
    const [newPizza, setNewPizza] = useState({
        nom_pizza: "",
        prix_pizza: 0,
        category: "",
        base: "",
        ingredients: [] as number[],
        image: null as File | null,
        imageUrl: "" as string,
    });
    const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
    const [editPizza, setEditPizza] = useState({
        nom_pizza: "",
        prix_pizza: 0,
        category: "",
        base: "",
        ingredients: [] as number[],
        image: null as File | null,
        imageUrl: "" as string,
    });

    useEffect(() => {
        if (activeTab === "ingredients") {
            fetchIngredients();
        } else if (
            activeTab === "pizzas" ||
            activeTab === "add-pizza" ||
            activeTab === "manage-pizzas"
        ) {
            fetchPizzas();
            fetchCategories();
            fetchIngredients(); // Charger aussi les ingrédients pour les checkboxes
        } else if (activeTab === "categories") {
            fetchCategories();
        } else if (activeTab === "bases") {
            fetchBases();
        } else if (activeTab === "horaires") {
            fetchHoraires();
        } else if (activeTab === "reviews") {
            fetchPendingReviews();
        } else if (activeTab === "google-reviews") {
            fetchGoogleReviews();
        }
    }, [activeTab]);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:5000/api/ingredients"
            );
            const ingredientsData = response.data.data || response.data;
            setIngredients(ingredientsData);
        } catch (error) {
            console.error("Erreur lors du chargement des ingrédients:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fonctions pour gérer les avis
    const fetchPendingReviews = async () => {
        try {
            setReviewsLoading(true);
            const response = await axios.get(
                "http://localhost:5000/api/avis/pending"
            );
            setPendingReviews(response.data);
        } catch (error) {
            console.error(
                "Erreur lors du chargement des avis en attente:",
                error
            );
        } finally {
            setReviewsLoading(false);
        }
    };

    // Fonctions pour gérer les avis Google
    const fetchGoogleReviews = async () => {
        try {
            setGoogleReviewsLoading(true);
            const response = await axios.get(
                "http://localhost:5000/api/google-avis"
            );
            setGoogleReviews(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des avis Google:", error);
        } finally {
            setGoogleReviewsLoading(false);
        }
    };

    const importGoogleReviews = async () => {
        if (!importData.trim()) {
            alert("Veuillez saisir des données d'avis à importer");
            return;
        }

        try {
            setImportLoading(true);
            const avisData = JSON.parse(importData);

            const response = await axios.post(
                "http://localhost:5000/api/google-avis/import",
                {
                    avis: Array.isArray(avisData) ? avisData : [avisData],
                }
            );

            alert(
                `Import réussi: ${response.data.imported} avis importés, ${response.data.skipped} avis ignorés`
            );
            setImportData("");
            fetchGoogleReviews();
        } catch (error) {
            console.error("Erreur lors de l'import:", error);
            if (error.response?.data?.error) {
                alert(`Erreur: ${error.response.data.error}`);
            } else {
                alert("Erreur lors de l'import. Vérifiez le format JSON.");
            }
        } finally {
            setImportLoading(false);
        }
    };

    const deleteGoogleReview = async (reviewId: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis Google ?")) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:5000/api/google-avis/${reviewId}`
            );
            setGoogleReviews((prev) =>
                prev.filter((review) => review.id !== reviewId)
            );
            alert("Avis Google supprimé avec succès");
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("Erreur lors de la suppression de l'avis");
        }
    };

    const updateReviewStatus = async (
        reviewId: number,
        status: "publie" | "banni"
    ) => {
        try {
            await axios.put(
                `http://localhost:5000/api/avis/${reviewId}/status`,
                {
                    statut: status,
                }
            );

            // Retirer l'avis de la liste des avis en attente
            setPendingReviews((prev) =>
                prev.filter((review) => review.id !== reviewId)
            );

            // TODO: Ici on pourra ajouter l'envoi d'email de notification
            console.log(
                `Avis ${status === "publie" ? "publié" : "banni"} avec succès`
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
        }
    };

    const fetchPizzas = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:5000/api/pizzas"
            );
            setPizzas(response.data.data || response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des pizzas:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/categories"
            );
            setCategories(response.data.data || response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des catégories:", error);
        }
    };

    const fetchBases = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/bases");
            setBases(response.data.data || response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des bases:", error);
        }
    };

    // Fonctions pour gérer la sélection des ingrédients
    const toggleIngredientForNewPizza = (ingredientId: number) => {
        setNewPizza((prev) => ({
            ...prev,
            ingredients: prev.ingredients.includes(ingredientId)
                ? prev.ingredients.filter((id) => id !== ingredientId)
                : [...prev.ingredients, ingredientId],
        }));
    };

    const toggleIngredientForEditPizza = (ingredientId: number) => {
        setEditPizza((prev) => ({
            ...prev,
            ingredients: prev.ingredients.includes(ingredientId)
                ? prev.ingredients.filter((id) => id !== ingredientId)
                : [...prev.ingredients, ingredientId],
        }));
    };

    const addIngredient = async () => {
        if (!newIngredient.trim()) return;

        try {
            await axios.post("http://localhost:5000/api/ingredients", {
                nom_ingredients: newIngredient,
                prix_ingredients: newIngredientPrice,
            });
            setNewIngredient("");
            setNewIngredientPrice(0);
            fetchIngredients();
            alert("Ingrédient ajouté avec succès!");
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'ingrédient:", error);
            alert("Erreur lors de l'ajout de l'ingrédient");
        }
    };

    const deleteIngredient = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet ingrédient ?"))
            return;

        try {
            await axios.delete(`http://localhost:5000/api/ingredients/${id}`);
            fetchIngredients();
            alert("Ingrédient supprimé avec succès!");
        } catch (error: any) {
            console.error("Erreur lors de la suppression:", error);

            // Extraire le message d'erreur du serveur
            let errorMessage = "Erreur lors de la suppression de l'ingrédient";
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
    };

    const startEditIngredient = (ingredient: Ingredient) => {
        setEditingIngredient(ingredient);
        setEditIngredientName(ingredient.nom_ingredients);
        setEditIngredientPrice(ingredient.prix_ingredients || 0);
    };

    const cancelEditIngredient = () => {
        setEditingIngredient(null);
        setEditIngredientName("");
        setEditIngredientPrice(0);
    };

    const updateIngredient = async () => {
        if (!editingIngredient || !editIngredientName.trim()) return;

        try {
            await axios.put(
                `http://localhost:5000/api/ingredients/${editingIngredient.id_ingredients}`,
                {
                    nom_ingredients: editIngredientName,
                    prix_ingredients: editIngredientPrice,
                }
            );
            setEditingIngredient(null);
            setEditIngredientName("");
            setEditIngredientPrice(0);
            fetchIngredients();
            alert("Ingrédient modifié avec succès!");
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            alert("Erreur lors de la modification de l'ingrédient");
        }
    };

    // Fonctions pour gérer les catégories
    const addCategory = async () => {
        if (!newCategory.trim()) return;

        try {
            await axios.post("http://localhost:5000/api/categories", {
                nom_pizza_categories: newCategory,
            });
            setNewCategory("");
            fetchCategories();
        } catch (error) {
            console.error("Erreur lors de l'ajout de la catégorie:", error);
        }
    };

    const deleteCategory = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?"))
            return;

        try {
            await axios.delete(`http://localhost:5000/api/categories/${id}`);
            fetchCategories();
            alert("Catégorie supprimée avec succès!");
        } catch (error: any) {
            console.error("Erreur lors de la suppression:", error);

            // Extraire le message d'erreur du serveur
            let errorMessage = "Erreur lors de la suppression de la catégorie";
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
    };

    const startEditCategory = (category: Category) => {
        setEditingCategory(category);
        setEditCategoryName(category.nom_pizza_categories);
    };

    const cancelEditCategory = () => {
        setEditingCategory(null);
        setEditCategoryName("");
    };

    const updateCategory = async () => {
        if (!editingCategory || !editCategoryName.trim()) return;

        try {
            await axios.put(
                `http://localhost:5000/api/categories/${editingCategory.id_pizza_categories}`,
                {
                    nom_pizza_categories: editCategoryName,
                }
            );
            setEditingCategory(null);
            setEditCategoryName("");
            fetchCategories();
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
        }
    };

    // Fonctions pour gérer les bases
    const addBase = async () => {
        if (!newBase.trim()) return;

        try {
            await axios.post("http://localhost:5000/api/bases", {
                nom_pizza_bases: newBase,
            });
            setNewBase("");
            fetchBases();
        } catch (error) {
            console.error("Erreur lors de l'ajout de la base:", error);
        }
    };

    const deleteBase = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette base ?")) return;

        try {
            await axios.delete(`http://localhost:5000/api/bases/${id}`);
            fetchBases();
            alert("Base supprimée avec succès!");
        } catch (error: any) {
            console.error("Erreur lors de la suppression:", error);

            // Extraire le message d'erreur du serveur
            let errorMessage = "Erreur lors de la suppression de la base";
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
    };

    const startEditBase = (base: Base) => {
        setEditingBase(base);
        setEditBaseName(base.nom_pizza_bases);
    };

    const cancelEditBase = () => {
        setEditingBase(null);
        setEditBaseName("");
    };

    const updateBase = async () => {
        if (!editingBase || !editBaseName.trim()) return;

        try {
            await axios.put(
                `http://localhost:5000/api/bases/${editingBase.id_pizza_bases}`,
                {
                    nom_pizza_bases: editBaseName,
                }
            );
            setEditingBase(null);
            setEditBaseName("");
            fetchBases();
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
        }
    };

    // Fonctions pour gérer les horaires
    const fetchHoraires = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:5000/api/horaires"
            );
            setHoraires(response.data.data || response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des horaires:", error);
        } finally {
            setLoading(false);
        }
    };

    const startEditHoraire = (horaire: Horaire) => {
        setEditingHoraire(horaire);
    };

    const cancelEditHoraire = () => {
        setEditingHoraire(null);
    };

    const updateHoraire = async (horaire: Horaire) => {
        try {
            // Convertir les valeurs null en chaînes vides pour l'envoi
            const dataToSend = {
                heure_debut_mat: horaire.heure_debut_mat || "",
                heure_fin_mat: horaire.heure_fin_mat || "",
                heure_debut_ap: horaire.heure_debut_ap || "",
                heure_fin_ap: horaire.heure_fin_ap || "",
            };

            console.log("Données horaire envoyées:", dataToSend);

            await axios.put(
                `http://localhost:5000/api/horaires/${horaire.id_horaire}`,
                dataToSend
            );
            setEditingHoraire(null);
            fetchHoraires();
            alert("Horaire mis à jour avec succès!");
        } catch (error) {
            console.error(
                "Erreur lors de la modification de l'horaire:",
                error
            );
            alert("Erreur lors de la modification de l'horaire");
        }
    };

    const clearHoraireField = (field: string) => {
        if (editingHoraire) {
            setEditingHoraire({
                ...editingHoraire,
                [field]: "",
            });
        }
    };

    // Fonction pour gérer l'upload d'image
    const handleImageUpload = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await axios.post(
                "http://localhost:5000/api/upload-image",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                return response.data.imageUrl;
            }
            return null;
        } catch (error) {
            console.error("Erreur lors de l'upload de l'image:", error);
            return null;
        }
    };

    const addPizza = async () => {
        if (
            !newPizza.nom_pizza.trim() ||
            !newPizza.prix_pizza ||
            !newPizza.base
        ) {
            alert(
                "Veuillez remplir tous les champs obligatoires (nom, prix et base)"
            );
            return;
        }

        try {
            // Trouver l'ID de la catégorie sélectionnée
            const selectedCategory = categories.find(
                (cat) => cat.nom_pizza_categories === newPizza.category
            );
            if (!selectedCategory) {
                alert("Veuillez sélectionner une catégorie");
                return;
            }

            // Préparer FormData pour envoyer les données et l'image
            const formData = new FormData();
            formData.append("nom_pizza", newPizza.nom_pizza);
            formData.append("prix_pizza", newPizza.prix_pizza.toString());
            formData.append(
                "id_pizza_categories",
                selectedCategory.id_pizza_categories.toString()
            );
            formData.append("base", newPizza.base);
            formData.append(
                "ingredients",
                JSON.stringify(newPizza.ingredients)
            );

            // Ajouter l'image si elle existe
            if (newPizza.image) {
                formData.append("image", newPizza.image);
            }

            console.log("📝 [DEBUG] Envoi des données pizza avec FormData");

            await axios.post("http://localhost:5000/api/pizzas", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setNewPizza({
                nom_pizza: "",
                prix_pizza: 0,
                category: "",
                base: "",
                ingredients: [],
                image: null,
                imageUrl: "",
            });
            fetchPizzas();
            alert("Pizza ajoutée avec succès!");
        } catch (error) {
            console.error("Erreur lors de l'ajout de la pizza:", error);
            alert("Erreur lors de l'ajout de la pizza");
        }
    };

    const deletePizza = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette pizza ?"))
            return;

        try {
            await axios.delete(`http://localhost:5000/api/pizzas/${id}`);
            fetchPizzas();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    const startEditPizza = (pizza: Pizza) => {
        setEditingPizza(pizza);
        // Convertir les ingrédients texte en tableau d'IDs
        const ingredientIds = pizza.ingredients
            ? pizza.ingredients
                  .split(", ")
                  .map((ingredientName) => {
                      const ingredient = ingredients.find(
                          (ing) => ing.nom_ingredients === ingredientName.trim()
                      );
                      return ingredient ? ingredient.id_ingredients : null;
                  })
                  .filter((id) => id !== null)
            : [];

        setEditPizza({
            nom_pizza: pizza.nom_pizza,
            prix_pizza: null, // Commencer avec null pour permettre l'utilisation du prix original
            category: pizza.category,
            base: pizza.base || "",
            ingredients: ingredientIds,
            image: null,
            imageUrl: "",
        });
    };

    const cancelEditPizza = () => {
        setEditingPizza(null);
        setEditPizza({
            nom_pizza: "",
            prix_pizza: null,
            category: "",
            base: "",
            ingredients: [],
            image: null,
            imageUrl: "",
        });
    };

    const updatePizza = async () => {
        // APPROCHE RADICALE: Utiliser TOUJOURS les valeurs originales sauf si explicitement modifiées
        const finalNomPizza =
            editPizza.nom_pizza && editPizza.nom_pizza.trim()
                ? editPizza.nom_pizza.trim()
                : editingPizza.nom_pizza;

        // Pour le prix: si le champ est vide ou null, utiliser le prix original
        let finalPrixPizza;
        if (
            editPizza.prix_pizza === null ||
            editPizza.prix_pizza === undefined ||
            editPizza.prix_pizza === 0
        ) {
            finalPrixPizza = parseFloat(String(editingPizza.prix_pizza));
        } else {
            finalPrixPizza = parseFloat(String(editPizza.prix_pizza));
        }

        const finalBase = editPizza.base || editingPizza.base;

        console.log(
            "RADICAL UPDATE - Prix edit:",
            editPizza.prix_pizza,
            "Prix original:",
            editingPizza.prix_pizza,
            "Prix final:",
            finalPrixPizza
        );

        // VALIDATION ULTRA SIMPLIFIÉE: Pas de validation complexe, juste vérifier l'existence
        if (!editingPizza) {
            alert("Erreur: aucune pizza sélectionnée");
            return;
        }

        try {
            // APPROCHE RADICALE: Utiliser toujours la catégorie originale si pas de nouvelle sélection
            let categoryId;
            if (editPizza.category && editPizza.category.trim() !== "") {
                const selectedCategory = categories.find(
                    (cat) => cat.nom_pizza_categories === editPizza.category
                );
                categoryId = selectedCategory
                    ? selectedCategory.id_pizza_categories
                    : editingPizza.id_pizza_categories;
            } else {
                categoryId = editingPizza.id_pizza_categories;
            }

            // CONSTRUCTION SIMPLIFIÉE DES DONNÉES
            const formData = new FormData();
            formData.append("nom_pizza", finalNomPizza);
            formData.append("prix_pizza", finalPrixPizza.toString());
            formData.append("id_pizza_categories", categoryId.toString());
            formData.append("base", finalBase);

            // Ingrédients: utiliser les nouveaux ou garder les anciens
            const finalIngredients =
                editPizza.ingredients.length > 0
                    ? editPizza.ingredients
                    : editingPizza.ingredients
                    ? editingPizza.ingredients
                          .split(", ")
                          .map((ingredientName) => {
                              const ingredient = ingredients.find(
                                  (ing) =>
                                      ing.nom_ingredients ===
                                      ingredientName.trim()
                              );
                              return ingredient
                                  ? ingredient.id_ingredients
                                  : null;
                          })
                          .filter((id) => id !== null)
                    : [];
            formData.append("ingredients", JSON.stringify(finalIngredients));

            // Image: ajouter seulement si nouvelle image sélectionnée
            if (editPizza.image) {
                formData.append("image", editPizza.image);
            }

            console.log("RADICAL UPDATE - Données envoyées:", {
                nom_pizza: finalNomPizza,
                prix_pizza: finalPrixPizza,
                id_pizza_categories: categoryId,
                base: finalBase,
                ingredients: finalIngredients,
                hasImage: !!editPizza.image,
            });

            const response = await axios.put(
                `http://localhost:5000/api/pizzas/${editingPizza.id_pizza}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("RADICAL UPDATE - Succès:", response.data);

            // Réinitialiser l'état après succès
            setEditingPizza(null);
            setEditPizza({
                nom_pizza: "",
                prix_pizza: null,
                category: "",
                base: "",
                ingredients: [],
                image: null,
                imageUrl: "",
            });
            fetchPizzas();
            alert(
                "🎉 Pizza modifiée avec succès! Aucune validation bloquante."
            );
        } catch (error) {
            console.error("RADICAL UPDATE - Erreur:", error);
            alert(
                "Erreur lors de la modification. Vérifiez la console pour plus de détails."
            );
        }
    };

    const renderDashboard = () => (
        <div className="admin-grid">
            <div
                className="admin-card"
                onClick={() => setActiveTab("add-pizza")}
            >
                <div className="admin-card-icon">➕</div>
                <h3>Ajouter des Pizzas</h3>
                <p>Créer de nouvelles pizzas pour votre menu</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Ajouter une pizza
                </button>
            </div>

            <div
                className="admin-card"
                onClick={() => setActiveTab("manage-pizzas")}
            >
                <div className="admin-card-icon">⚙️</div>
                <h3>Modifier/Supprimer des Pizzas</h3>
                <p>Gérer les pizzas existantes du menu</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Gérer les pizzas
                </button>
            </div>

            <div
                className="admin-card"
                onClick={() => setActiveTab("ingredients")}
            >
                <div className="admin-card-icon">🧄</div>
                <h3>Ingrédients</h3>
                <p>Gérer la liste des ingrédients disponibles</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Gérer les ingrédients
                </button>
            </div>

            <div
                className="admin-card"
                onClick={() => setActiveTab("categories")}
            >
                <div className="admin-card-icon">📂</div>
                <h3>Catégories</h3>
                <p>Gérer les catégories de pizzas</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Gérer les catégories
                </button>
            </div>

            <div className="admin-card" onClick={() => setActiveTab("bases")}>
                <div className="admin-card-icon">🍅</div>
                <h3>Bases</h3>
                <p>Gérer les bases de pizzas (Crème/Tomate)</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Gérer les bases
                </button>
            </div>

            <div className="admin-card">
                <div className="admin-card-icon">📋</div>
                <h3>Commandes</h3>
                <p>Suivre et gérer les commandes clients</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Voir les commandes
                </button>
            </div>

            <div
                className="admin-card"
                onClick={() => setActiveTab("horaires")}
            >
                <div className="admin-card-icon">⏰</div>
                <h3>Horaires</h3>
                <p>Modifier les horaires d'ouverture</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Gérer les horaires
                </button>
            </div>

            <div className="admin-card" onClick={() => setActiveTab("reviews")}>
                <div className="admin-card-icon">💬</div>
                <h3>Gestion des commentaires</h3>
                <p>Modérer les avis clients en attente</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Gérer les avis
                </button>
            </div>

            <div
                className="admin-card"
                onClick={() => setActiveTab("google-reviews")}
            >
                <div className="admin-card-icon">🌟</div>
                <h3>Avis Google</h3>
                <p>Importer et gérer les avis Google</p>
                <button className="btn btn-admin-discover admin-dashboard-button">
                    Gérer les avis Google
                </button>
            </div>
        </div>
    );

    const renderIngredients = () => (
        <div className="admin-section">
            <div className="section-header">
                <h2>Gestion des Ingrédients</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                >
                    Retour au tableau de bord
                </button>
            </div>

            <div className="add-form">
                <h3>Ajouter un ingrédient</h3>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Nom de l'ingrédient"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        className="form-input"
                    />
                    <input
                        type="number"
                        placeholder="Prix (€)"
                        value={newIngredientPrice}
                        onChange={(e) =>
                            setNewIngredientPrice(
                                parseFloat(e.target.value) || 0
                            )
                        }
                        className="form-input"
                        step="0.01"
                        min="0"
                    />

                    <button
                        onClick={addIngredient}
                        className="btn btn-admin-discover"
                    >
                        Ajouter
                    </button>
                </div>
            </div>

            <div className="items-list">
                <h3>Liste des ingrédients</h3>
                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Prix (€)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ingredients.map((ingredient) => (
                                    <tr key={ingredient.id_ingredients}>
                                        <td>
                                            {editingIngredient?.id_ingredients ===
                                            ingredient.id_ingredients ? (
                                                <input
                                                    type="text"
                                                    value={editIngredientName}
                                                    onChange={(e) =>
                                                        setEditIngredientName(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-input"
                                                />
                                            ) : (
                                                ingredient.nom_ingredients
                                            )}
                                        </td>
                                        <td>
                                            {editingIngredient?.id_ingredients ===
                                            ingredient.id_ingredients ? (
                                                <input
                                                    type="number"
                                                    value={editIngredientPrice}
                                                    onChange={(e) =>
                                                        setEditIngredientPrice(
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                    className="form-input"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            ) : (
                                                `${
                                                    parseFloat(
                                                        String(
                                                            ingredient.prix_ingredients ||
                                                                0
                                                        )
                                                    )?.toFixed(2) || "0.00"
                                                }`
                                            )}
                                        </td>
                                        <td>
                                            {editingIngredient?.id_ingredients ===
                                            ingredient.id_ingredients ? (
                                                <div className="btn-group">
                                                    <button
                                                        onClick={
                                                            updateIngredient
                                                        }
                                                        className="btn btn-success btn-small"
                                                    >
                                                        Sauvegarder
                                                    </button>
                                                    <button
                                                        onClick={
                                                            cancelEditIngredient
                                                        }
                                                        className="btn btn-secondary btn-small"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="btn-group">
                                                    <div className="btn-actions-container">
                                                        <button
                                                            onClick={() =>
                                                                startEditIngredient(
                                                                    ingredient
                                                                )
                                                            }
                                                            className="btn-icon-edit"
                                                            title="Modifier l'ingrédient"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                deleteIngredient(
                                                                    ingredient.id_ingredients
                                                                )
                                                            }
                                                            className="btn-icon-delete"
                                                            title="Supprimer l'ingrédient"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAddPizza = () => (
        <div className="admin-add-pizza-page">
            <div className="add-pizza-header">
                <button
                    className="btn btn-secondary back-button"
                    onClick={() => setActiveTab("dashboard")}
                >
                    ← Retour au tableau de bord
                </button>
                <div className="page-title">
                    <h1>🍕 Ajouter une Nouvelle Pizza</h1>
                    <p>Créez une délicieuse pizza pour enrichir votre menu</p>
                </div>
            </div>

            <div className="add-pizza-container">
                <div className="add-pizza-form">
                    <div className="form-section">
                        <h3>Informations de base</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    Nom de la pizza *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Margherita, Pepperoni..."
                                    value={newPizza.nom_pizza}
                                    onChange={(e) =>
                                        setNewPizza({
                                            ...newPizza,
                                            nom_pizza: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Prix TTC (€) *
                                </label>
                                <input
                                    type="text"
                                    placeholder="0.00"
                                    value={newPizza.prix_pizza}
                                    onChange={(e) =>
                                        setNewPizza({
                                            ...newPizza,
                                            prix_pizza:
                                                parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Catégorie *
                                </label>
                                <select
                                    value={newPizza.category}
                                    onChange={(e) =>
                                        setNewPizza({
                                            ...newPizza,
                                            category: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                >
                                    <option value="">
                                        Sélectionner une catégorie
                                    </option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id_pizza_categories}
                                            value={
                                                category.nom_pizza_categories
                                            }
                                        >
                                            {category.nom_pizza_categories}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Base de pizza *
                                </label>
                                <select
                                    value={newPizza.base}
                                    onChange={(e) =>
                                        setNewPizza({
                                            ...newPizza,
                                            base: e.target.value,
                                        })
                                    }
                                    className="form-input"
                                >
                                    <option value="">
                                        Sélectionner une base
                                    </option>
                                    <option value="Crème">Crème</option>
                                    <option value="Tomate">Tomate</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Photo de la pizza
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0] || null;
                                        setNewPizza({
                                            ...newPizza,
                                            image: file,
                                            imageUrl: file
                                                ? URL.createObjectURL(file)
                                                : "",
                                        });
                                    }}
                                    className="form-input"
                                />
                                {newPizza.imageUrl && (
                                    <div className="image-preview">
                                        <img
                                            src={newPizza.imageUrl}
                                            alt="Aperçu"
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                                marginTop: "10px",
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Sélection des ingrédients</h3>
                        <div className="ingredients-section">
                            <div className="ingredients-grid">
                                {ingredients.map((ingredient) => (
                                    <label
                                        key={ingredient.id_ingredients}
                                        className="checkbox-label"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={newPizza.ingredients.includes(
                                                ingredient.id_ingredients
                                            )}
                                            onChange={() =>
                                                toggleIngredientForNewPizza(
                                                    ingredient.id_ingredients
                                                )
                                            }
                                            className="checkbox-input"
                                        />
                                        <span className="checkbox-text">
                                            {ingredient.nom_ingredients}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-section">
                        <button
                            onClick={addPizza}
                            className="btn btn-admin-discover btn-large"
                        >
                            🍕 Ajouter la pizza au menu
                        </button>
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className="btn btn-secondary"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderManagePizzas = () => (
        <div className="admin-section">
            <div className="section-header">
                <h2>Gestion des Pizzas</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                >
                    Retour au tableau de bord
                </button>
            </div>
            {editingPizza && (
                <div className="add-form">
                    <h3>✏️ Modification en cours</h3>
                    <div className="form-grid">
                        <input
                            type="text"
                            placeholder="Nom de la pizza"
                            value={editPizza.nom_pizza}
                            onChange={(e) =>
                                setEditPizza({
                                    ...editPizza,
                                    nom_pizza: e.target.value,
                                })
                            }
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Prix TTC (€)"
                            value={
                                editPizza.prix_pizza === null ||
                                editPizza.prix_pizza === 0
                                    ? ""
                                    : editPizza.prix_pizza
                            }
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                    setEditPizza({
                                        ...editPizza,
                                        prix_pizza: null,
                                    });
                                } else {
                                    const numValue = parseFloat(value);
                                    setEditPizza({
                                        ...editPizza,
                                        prix_pizza: isNaN(numValue)
                                            ? null
                                            : numValue,
                                    });
                                }
                            }}
                            className="form-input"
                        />
                        <select
                            value={editPizza.category}
                            onChange={(e) =>
                                setEditPizza({
                                    ...editPizza,
                                    category: e.target.value,
                                })
                            }
                            className="form-input"
                        >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((category) => (
                                <option
                                    key={category.id_pizza_categories}
                                    value={category.nom_pizza_categories}
                                >
                                    {category.nom_pizza_categories}
                                </option>
                            ))}
                        </select>
                        <select
                            value={editPizza.base}
                            onChange={(e) =>
                                setEditPizza({
                                    ...editPizza,
                                    base: e.target.value,
                                })
                            }
                            className="form-input"
                        >
                            <option value="">Sélectionner une base</option>
                            <option value="Crème">Crème</option>
                            <option value="Tomate">Tomate</option>
                        </select>

                        <div className="form-group">
                            <label className="form-label">
                                Changer la photo de la pizza
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setEditPizza({
                                        ...editPizza,
                                        image: file,
                                        imageUrl: file
                                            ? URL.createObjectURL(file)
                                            : "",
                                    });
                                }}
                                className="form-input"
                            />
                            {editPizza.imageUrl && (
                                <div className="image-preview">
                                    <img
                                        src={editPizza.imageUrl}
                                        alt="Aperçu"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="ingredients-section">
                            <label className="form-label">Ingrédients:</label>
                            <div className="ingredients-grid">
                                {ingredients.map((ingredient) => (
                                    <label
                                        key={ingredient.id_ingredients}
                                        className="checkbox-label"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={editPizza.ingredients.includes(
                                                ingredient.id_ingredients
                                            )}
                                            onChange={() =>
                                                toggleIngredientForEditPizza(
                                                    ingredient.id_ingredients
                                                )
                                            }
                                            className="checkbox-input"
                                        />
                                        <span className="checkbox-text">
                                            {ingredient.nom_ingredients}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button
                            onClick={updatePizza}
                            className="btn btn-admin-discover"
                        >
                            💾 Sauvegarder
                        </button>
                        <button
                            onClick={cancelEditPizza}
                            className="btn btn-secondary"
                        >
                            ❌ Annuler
                        </button>
                    </div>
                </div>
            )}

            <div className="items-list">
                <h3>Liste des pizzas ({pizzas.length})</h3>

                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th>Nom</th>
                                    <th>Ingrédients</th>
                                    <th>Prix</th>
                                    <th>Catégorie</th>
                                    <th>Base</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pizzas.map((pizza) => (
                                    <tr key={pizza.id_pizza}>
                                        <td>
                                            <img
                                                src={
                                                    pizza.image_url
                                                        ? pizza.image_url.startsWith(
                                                              "/uploads/"
                                                          ) ||
                                                          pizza.image_url.startsWith(
                                                              "/images/"
                                                          )
                                                            ? `http://localhost:5000${pizza.image_url}`
                                                            : pizza.image_url
                                                        : "/images/pizza.jpg"
                                                }
                                                alt={pizza.nom_pizza}
                                                className="pizza-table-image"
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                }}
                                                onError={(e) => {
                                                    const target =
                                                        e.target as HTMLImageElement;
                                                    target.src =
                                                        "/images/pizza.jpg";
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <strong>{pizza.nom_pizza}</strong>
                                        </td>
                                        <td>
                                            <span className="ingredients-text">
                                                {pizza.ingredients}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="price-text">
                                                {typeof pizza.prix_pizza ===
                                                "string"
                                                    ? pizza.prix_pizza
                                                    : pizza.prix_pizza + "€"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="category-text">
                                                {pizza.category ||
                                                    "Non définie"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="base-text">
                                                {pizza.base || "Non définie"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-actions-container">
                                                <button
                                                    onClick={() =>
                                                        startEditPizza(pizza)
                                                    }
                                                    className="btn-icon-edit"
                                                    title="Modifier cette pizza"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deletePizza(
                                                            pizza.id_pizza
                                                        )
                                                    }
                                                    className="btn-icon-delete"
                                                    title="Supprimer cette pizza"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pizzas.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="empty-state">
                                            <p>🍕 Aucune pizza dans le menu</p>
                                            <p>
                                                Commencez par ajouter votre
                                                première pizza !
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCategories = () => (
        <div className="admin-section">
            <div className="section-header">
                <h2>Gestion des Catégories</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                >
                    Retour au tableau de bord
                </button>
            </div>

            <div className="add-form">
                <h3>Ajouter une catégorie</h3>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Nom de la catégorie"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="form-input"
                    />
                    <button
                        onClick={addCategory}
                        className="btn btn-admin-discover"
                    >
                        Ajouter
                    </button>
                </div>
            </div>

            <div className="items-list">
                <h3>Liste des catégories</h3>
                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id_pizza_categories}>
                                        <td>{category.id_pizza_categories}</td>
                                        <td>
                                            {editingCategory &&
                                            editingCategory.id_pizza_categories ===
                                                category.id_pizza_categories ? (
                                                <input
                                                    type="text"
                                                    value={editCategoryName}
                                                    onChange={(e) =>
                                                        setEditCategoryName(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-input"
                                                />
                                            ) : (
                                                category.nom_pizza_categories
                                            )}
                                        </td>
                                        <td>
                                            {editingCategory &&
                                            editingCategory.id_pizza_categories ===
                                                category.id_pizza_categories ? (
                                                <>
                                                    <button
                                                        onClick={updateCategory}
                                                        className="btn btn-admin-discover btn-small"
                                                    >
                                                        Sauvegarder
                                                    </button>
                                                    <button
                                                        onClick={
                                                            cancelEditCategory
                                                        }
                                                        className="btn btn-secondary btn-small"
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="btn-actions-container">
                                                    <button
                                                        onClick={() =>
                                                            startEditCategory(
                                                                category
                                                            )
                                                        }
                                                        className="btn-icon-edit"
                                                        title="Modifier la catégorie"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteCategory(
                                                                category.id_pizza_categories
                                                            )
                                                        }
                                                        className="btn-icon-delete"
                                                        title="Supprimer la catégorie"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderBases = () => (
        <div className="admin-section">
            <div className="section-header">
                <h2>Gestion des Bases</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                >
                    Retour au tableau de bord
                </button>
            </div>

            <div className="add-form">
                <h3>Ajouter une base</h3>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Nom de la base (ex: Crème, Tomate)"
                        value={newBase}
                        onChange={(e) => setNewBase(e.target.value)}
                        className="form-input"
                    />
                    <button
                        onClick={addBase}
                        className="btn btn-admin-discover"
                    >
                        Ajouter
                    </button>
                </div>
            </div>

            <div className="items-list">
                <h3>Liste des bases</h3>
                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="table-container">
                        <table className="bases-table">
                            <thead>
                                <tr>
                                    <th className="bases-th">ID</th>
                                    <th className="bases-th">Nom</th>
                                    <th className="bases-th-actions">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {bases.map((base) => (
                                    <tr key={base.id_pizza_bases}>
                                        <td className="bases-td">
                                            {base.id_pizza_bases}
                                        </td>
                                        <td className="bases-td">
                                            {editingBase &&
                                            editingBase.id_pizza_bases ===
                                                base.id_pizza_bases ? (
                                                <input
                                                    type="text"
                                                    value={editBaseName}
                                                    onChange={(e) =>
                                                        setEditBaseName(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="form-input"
                                                />
                                            ) : (
                                                base.nom_pizza_bases
                                            )}
                                        </td>
                                        <td className="bases-td-actions">
                                            {editingBase &&
                                            editingBase.id_pizza_bases ===
                                                base.id_pizza_bases ? (
                                                <>
                                                    <button
                                                        onClick={updateBase}
                                                        className="btn btn-admin-discover btn-small"
                                                    >
                                                        Sauvegarder
                                                    </button>
                                                    <button
                                                        onClick={cancelEditBase}
                                                        className="btn btn-secondary btn-small"
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="btn-actions-container">
                                                    <button
                                                        onClick={() =>
                                                            startEditBase(base)
                                                        }
                                                        className="btn-icon-edit"
                                                        title="Modifier la base"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deleteBase(
                                                                base.id_pizza_bases
                                                            )
                                                        }
                                                        className="btn-icon-delete"
                                                        title="Supprimer la base"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderReviews = () => (
        <div className="admin-section">
            <div className="section-header">
                <h2>Gestion des commentaires</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                >
                    Retour au tableau de bord
                </button>
            </div>

            <div className="reviews-moderation">
                <h3>Avis en attente de modération</h3>
                {reviewsLoading ? (
                    <p>Chargement des avis...</p>
                ) : pendingReviews.length === 0 ? (
                    <div className="no-reviews">
                        <p>✅ Aucun avis en attente de modération</p>
                    </div>
                ) : (
                    <div className="reviews-grid">
                        {pendingReviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <h4>{review.nom}</h4>
                                    <div className="review-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={
                                                    i < review.note
                                                        ? "star filled"
                                                        : "star"
                                                }
                                            >
                                                ⭐
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="review-content">
                                    <p>
                                        {review.commentaire ||
                                            "Aucun commentaire"}
                                    </p>
                                </div>

                                <div className="review-meta">
                                    <small>
                                        Soumis le:{" "}
                                        {new Date(
                                            review.date_creation
                                        ).toLocaleDateString("fr-FR")}
                                    </small>
                                </div>

                                <div className="review-actions">
                                    <button
                                        onClick={() =>
                                            updateReviewStatus(
                                                review.id,
                                                "publie"
                                            )
                                        }
                                        className="btn btn-success btn-small"
                                    >
                                        ✅ Publier
                                    </button>
                                    <button
                                        onClick={() =>
                                            updateReviewStatus(
                                                review.id,
                                                "banni"
                                            )
                                        }
                                        className="btn btn-danger btn-small"
                                    >
                                        ❌ Bannir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderHoraires = () => (
        <div className="admin-section">
            <div className="section-header">
                <h2>Gestion des Horaires</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                >
                    Retour au tableau de bord
                </button>
            </div>

            <div className="items-list">
                <h3>Horaires d'ouverture</h3>
                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="table-container">
                        <table className="horaires-table">
                            <thead>
                                <tr>
                                    <th className="horaires-th">Jour</th>
                                    <th className="horaires-th">
                                        Matin (Début)
                                    </th>
                                    <th className="horaires-th">Matin (Fin)</th>
                                    <th className="horaires-th">
                                        Après-midi (Début)
                                    </th>
                                    <th className="horaires-th">
                                        Après-midi (Fin)
                                    </th>
                                    <th className="horaires-th-actions">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {horaires.map((horaire) => (
                                    <tr key={horaire.id_horaire}>
                                        <td className="horaires-td">
                                            <strong>{horaire.jour}</strong>
                                        </td>
                                        <td className="horaires-td">
                                            {editingHoraire &&
                                            editingHoraire.id_horaire ===
                                                horaire.id_horaire ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "5px",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <input
                                                        type="time"
                                                        value={
                                                            editingHoraire.heure_debut_mat ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setEditingHoraire({
                                                                ...editingHoraire,
                                                                heure_debut_mat:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="form-input"
                                                        style={{
                                                            width: "120px",
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            clearHoraireField(
                                                                "heure_debut_mat"
                                                            )
                                                        }
                                                        className="btn btn-danger btn-small"
                                                        title="Fermer le matin"
                                                        style={{
                                                            padding: "2px 6px",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                horaire.heure_debut_mat ||
                                                "Fermé"
                                            )}
                                        </td>
                                        <td className="horaires-td">
                                            {editingHoraire &&
                                            editingHoraire.id_horaire ===
                                                horaire.id_horaire ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "5px",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <input
                                                        type="time"
                                                        value={
                                                            editingHoraire.heure_fin_mat ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setEditingHoraire({
                                                                ...editingHoraire,
                                                                heure_fin_mat:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="form-input"
                                                        style={{
                                                            width: "120px",
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            clearHoraireField(
                                                                "heure_fin_mat"
                                                            )
                                                        }
                                                        className="btn btn-danger btn-small"
                                                        title="Fermer le matin"
                                                        style={{
                                                            padding: "2px 6px",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                horaire.heure_fin_mat || "Fermé"
                                            )}
                                        </td>
                                        <td className="horaires-td">
                                            {editingHoraire &&
                                            editingHoraire.id_horaire ===
                                                horaire.id_horaire ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "5px",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <input
                                                        type="time"
                                                        value={
                                                            editingHoraire.heure_debut_ap ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setEditingHoraire({
                                                                ...editingHoraire,
                                                                heure_debut_ap:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="form-input"
                                                        style={{
                                                            width: "120px",
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            clearHoraireField(
                                                                "heure_debut_ap"
                                                            )
                                                        }
                                                        className="btn btn-danger btn-small"
                                                        title="Fermer l'après-midi"
                                                        style={{
                                                            padding: "2px 6px",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                horaire.heure_debut_ap ||
                                                "Fermé"
                                            )}
                                        </td>
                                        <td className="horaires-td">
                                            {editingHoraire &&
                                            editingHoraire.id_horaire ===
                                                horaire.id_horaire ? (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "5px",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <input
                                                        type="time"
                                                        value={
                                                            editingHoraire.heure_fin_ap ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setEditingHoraire({
                                                                ...editingHoraire,
                                                                heure_fin_ap:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="form-input"
                                                        style={{
                                                            width: "120px",
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            clearHoraireField(
                                                                "heure_fin_ap"
                                                            )
                                                        }
                                                        className="btn btn-danger btn-small"
                                                        title="Fermer l'après-midi"
                                                        style={{
                                                            padding: "2px 6px",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                horaire.heure_fin_ap || "Fermé"
                                            )}
                                        </td>
                                        <td className="horaires-td-actions">
                                            {editingHoraire &&
                                            editingHoraire.id_horaire ===
                                                horaire.id_horaire ? (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            updateHoraire(
                                                                editingHoraire
                                                            )
                                                        }
                                                        className="btn-horaire-save"
                                                    >
                                                        Sauvegarder
                                                    </button>
                                                    <button
                                                        onClick={
                                                            cancelEditHoraire
                                                        }
                                                        className="btn-horaire-cancel"
                                                    >
                                                        Annuler
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="btn-actions-container">
                                                    <button
                                                        onClick={() =>
                                                            startEditHoraire(
                                                                horaire
                                                            )
                                                        }
                                                        className="btn-icon-edit"
                                                        title="Modifier les horaires"
                                                    >
                                                        ✏️
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderGoogleReviews = () => (
        <div className="admin-section">
            <div className="section-header">
                <h2>Gestion des Avis Google</h2>
                <button
                    className="btn btn-secondary"
                    onClick={() => setActiveTab("dashboard")}
                >
                    Retour au tableau de bord
                </button>
            </div>

            <div className="add-form">
                <h3>Importer des avis Google</h3>
                <p className="form-help">
                    Collez ici les données JSON des avis Google. Format attendu
                    :
                    <code>
                        [&#123;"nom": "Nom du client", "note": 5, "commentaire":
                        "Excellent!", "date_google": "2024-01-15"&#125;]
                    </code>
                </p>
                <div className="form-group">
                    <textarea
                        placeholder='[{"nom": "Jean Dupont", "note": 5, "commentaire": "Excellente pizza!", "date_google": "2024-01-15"}]'
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        className="form-textarea"
                        rows={6}
                        style={{ fontFamily: "monospace", fontSize: "12px" }}
                    />
                    <button
                        onClick={importGoogleReviews}
                        className="btn btn-admin-discover"
                        disabled={importLoading}
                    >
                        {importLoading
                            ? "Import en cours..."
                            : "Importer les avis"}
                    </button>
                </div>
            </div>

            <div className="items-list">
                <h3>Avis Google importés ({googleReviews.length})</h3>
                {googleReviewsLoading ? (
                    <p>Chargement...</p>
                ) : googleReviews.length === 0 ? (
                    <p>Aucun avis Google importé pour le moment.</p>
                ) : (
                    <div className="reviews-grid">
                        {googleReviews.map((review) => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        {review.reviewer_profile_photo && (
                                            <img
                                                src={
                                                    review.reviewer_profile_photo
                                                }
                                                alt={review.nom}
                                                className="reviewer-photo"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    marginRight: "10px",
                                                }}
                                            />
                                        )}
                                        <div>
                                            <strong>{review.nom}</strong>
                                            {review.reviewer_total_reviews && (
                                                <div className="reviewer-stats">
                                                    {
                                                        review.reviewer_total_reviews
                                                    }{" "}
                                                    avis au total
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="review-source">
                                        <span className="source-badge google">
                                            🌟 Google
                                        </span>
                                    </div>
                                </div>

                                <div className="review-rating">
                                    {"⭐".repeat(review.note)}
                                    <span className="rating-number">
                                        ({review.note}/5)
                                    </span>
                                </div>

                                {review.commentaire && (
                                    <div className="review-comment">
                                        <p>{review.commentaire}</p>
                                    </div>
                                )}

                                <div className="review-footer">
                                    <div className="review-dates">
                                        {review.date_google && (
                                            <small>
                                                Date Google:{" "}
                                                {new Date(
                                                    review.date_google
                                                ).toLocaleDateString("fr-FR")}
                                            </small>
                                        )}
                                        <small>
                                            Importé le:{" "}
                                            {new Date(
                                                review.date_creation
                                            ).toLocaleDateString("fr-FR")}
                                        </small>
                                    </div>
                                    <div className="btn-actions-container">
                                        <button
                                            onClick={() =>
                                                deleteGoogleReview(review.id)
                                            }
                                            className="btn-icon-delete"
                                            title="Supprimer l'avis"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="admin admin-page">
            <div className="container">
                <header className="admin-header">
                    <h1>Administration Oh'Pizza</h1>
                    <p>Gestion du restaurant</p>
                </header>

                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "ingredients" && renderIngredients()}
                {activeTab === "add-pizza" && renderAddPizza()}
                {activeTab === "manage-pizzas" && renderManagePizzas()}
                {activeTab === "categories" && renderCategories()}
                {activeTab === "bases" && renderBases()}
                {activeTab === "horaires" && renderHoraires()}
                {activeTab === "reviews" && renderReviews()}
                {activeTab === "google-reviews" && renderGoogleReviews()}
            </div>
        </div>
    );
};

export default Admin;
