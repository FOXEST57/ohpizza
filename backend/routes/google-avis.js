import express from "express";
import pool from "../models/database.js";

const router = express.Router();

// Route pour importer des avis Google manuellement
router.post("/import", async (req, res) => {
    try {
        const { avis } = req.body;

        if (!avis || !Array.isArray(avis)) {
            return res.status(400).json({ error: "Format d'avis invalide" });
        }

        let importedCount = 0;
        let skippedCount = 0;

        for (const avisItem of avis) {
            const {
                nom,
                note,
                commentaire,
                date_google,
                google_review_id,
                reviewer_profile_photo,
                reviewer_total_reviews,
            } = avisItem;

            // Validation des champs obligatoires
            if (!nom || !note || note < 1 || note > 5) {
                skippedCount++;
                continue;
            }

            try {
                // Vérifier si l'avis Google existe déjà
                if (google_review_id) {
                    const [existing] = await pool.execute(
                        "SELECT id FROM avis WHERE google_review_id = ?",
                        [google_review_id]
                    );

                    if (existing.length > 0) {
                        skippedCount++;
                        continue;
                    }
                }

                // Insérer l'avis Google
                await pool.execute(
                    `
          INSERT INTO avis (
            nom, note, commentaire, date_creation, statut, source, 
            date_google, google_review_id, reviewer_profile_photo, reviewer_total_reviews
          ) VALUES (?, ?, ?, NOW(), 'publie', 'google', ?, ?, ?, ?)
        `,
                    [
                        nom,
                        note,
                        commentaire || "",
                        date_google || null,
                        google_review_id || null,
                        reviewer_profile_photo || null,
                        reviewer_total_reviews || null,
                    ]
                );

                importedCount++;
            } catch (error) {
                console.error("Erreur lors de l'insertion d'un avis:", error);
                skippedCount++;
            }
        }

        res.json({
            message: `Import terminé: ${importedCount} avis importés, ${skippedCount} avis ignorés`,
            imported: importedCount,
            skipped: skippedCount,
        });
    } catch (error) {
        console.error("Erreur lors de l'import des avis Google:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'import" });
    }
});

// Route pour récupérer les avis Google uniquement
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.execute(`
      SELECT 
        id, nom, note, commentaire, date_creation, statut,
        date_google, google_review_id, reviewer_profile_photo, reviewer_total_reviews
      FROM avis 
      WHERE source = 'google' AND statut = 'publie'
      ORDER BY date_creation DESC
    `);

        res.json(rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des avis Google:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour supprimer un avis Google
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'avis existe et est de source Google
        const [existing] = await pool.execute(
            'SELECT id FROM avis WHERE id = ? AND source = "google"',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: "Avis Google non trouvé" });
        }

        await pool.execute("DELETE FROM avis WHERE id = ?", [id]);

        res.json({ message: "Avis Google supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'avis Google:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour obtenir les statistiques des avis Google
router.get("/stats", async (req, res) => {
    try {
        const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        AVG(note) as moyenne,
        COUNT(CASE WHEN note = 5 THEN 1 END) as cinq_etoiles,
        COUNT(CASE WHEN note = 4 THEN 1 END) as quatre_etoiles,
        COUNT(CASE WHEN note = 3 THEN 1 END) as trois_etoiles,
        COUNT(CASE WHEN note = 2 THEN 1 END) as deux_etoiles,
        COUNT(CASE WHEN note = 1 THEN 1 END) as une_etoile
      FROM avis 
      WHERE source = 'google' AND statut = 'publie'
    `);

        res.json(stats[0]);
    } catch (error) {
        console.error(
            "Erreur lors de la récupération des statistiques Google:",
            error
        );
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;