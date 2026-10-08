# IAgile — Expérience apprenant V17 (pilote)

Une application statique autonome, créée à partir des ressources pédagogiques IAgile sur Google Drive :
- Expérience apprenant & format premium — Processus du quotidien
- Onboarding 30 minutes — Processus du quotidien
- Lead magnet — Diagnostic IA du quotidien & défi 15 minutes
- Module 0 — Diagnostiquer son quotidien et choisir les bons usages
- Module 1 — Bien travailler avec une IA
- Pack d'exercices — Processus du quotidien
- Template — Playbook IA du quotidien
- Projet final — Construire son système personnel avec l'IA
- Grille de validation finale — Processus du quotidien

## Parcours réellement interactifs
1. Personnalisation : Organiser / Produire / Analyser / Coordonner ; Essentiel / Approfondi.
2. Défi 15 minutes : saisie d'une vraie tâche et calcul du gain net (temps de préparation + génération + vérification + correction).
3. Module 0 : trois tâches concrètes, filtre de risque et engagement de validation humaine.
4. Module 1 : constructeur de brief à six éléments, copie, règles explicites de vérification.
5. Playbook personnel : 1 à 10 fiches, édition, export Markdown, impression.
6. Sauvegarde / restauration JSON locale, avec validation et réinitialisation explicite.

## Limites et sécurité
- **Pilote accessible par URL : pas de comptes ni de contrôle d'accès**. Ne convient pas à la vente de cours protégés.
- **Aucune requête serveur pour les données apprenantes**. Réponses sauvegardées en localStorage par navigateur. Sur appareils partagés, les autres utilisateurs du même navigateur pourraient les lire. Pas de synchronisation.
- Ne pas entrer de données sensibles/confidentielles. Le document HTML demande explicitement des exemples non sensibles.
- Les auto-validations sont des contrôles de saisie, **pas** une évaluation pédagogique réelle ou un modèle IA. Aucun score automatique ni certificat.
- Modules 2 à 8 annoncés uniquement comme prochaines étapes ; ne pas laisser entendre qu'ils sont disponibles.
- Documents Drive : divergence identifiée entre seuils de validation du projet final (70/100 et 80/100). À harmoniser avant lancement.
- L'accès est volontairement `noindex,nofollow` et la page n'est pas intégrée au catalogue commercial.

## Tester

```bash
python -m http.server 8765 --directory ..
# Puis http://localhost:8765/pilote/
node --check pilote.js
```

Tester sur ordinateur et mobile : navigation entre étapes, progression, validation des formulaires, erreurs, persistance après rechargement, téléchargement Markdown + JSON, import, suppression et reset.
