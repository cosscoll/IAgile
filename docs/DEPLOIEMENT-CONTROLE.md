# IAgile — Passer à une publication GitHub Pages contrôlée

**Statut au 11 octobre 2026 : préparé, pas encore activé.**
Ce dépôt utilise aujourd'hui GitHub Pages natif/Jekyll sur main. Le workflow de QA .github/workflows/deploy.yml n'empêche pas une publication native si les tests échouent.

## Ce qui est prêt

- scripts/build-public.mjs construit un artefact strictement limité aux 50 fichiers explicitement autorisés dans .github/workflows/deploy.yml.
- tests/publication-boundary.test.mjs compare exactement les fichiers publiables à la liste d'autorisation et recherche des secrets apparents.
- tests/staged-public.test.mjs contrôle le HTML de l'artefact, ses liens internes et le marqueur SHA.
- .github/workflows/pages-controlled.yml exécute les tests **avant** la publication, déploie l'artefact sur Pages, puis vérifie la version publique et la non-exposition de chemins internes.
- _config.yml protège les fichiers non commerciaux tant que la publication native Jekyll reste active.

## Procédure de bascule — opération unique, manuelle

1. Vérifier dans GitHub Actions que la dernière exécution de « IAgile — QA only (native GitHub Pages publishes) » est réussie. Ne pas basculer si elle échoue.
2. Vérifier que le fichier .github/workflows/pages-controlled.yml est présent sur main.
3. Ouvrir **GitHub > cosscoll/IAgile > Settings > Pages > Build and deployment**.
4. Changer **Source** de « Deploy from a branch » vers **GitHub Actions**.
5. Ouvrir **Actions > IAgile — Déploiement contrôlé (activation manuelle) > Run workflow**, sélectionner main puis lancer.
6. Contrôler le succès des jobs build, deploy et verify. Le job verify confirme la présence du SHA exact dans la page d'accueil, les URLs attendues (HTTP 200) et l'absence des ressources internes listées (HTTP 404/410).
7. Contrôler dans un vrai navigateur ordinateur et mobile la navigation, le chatbot guidé, les quatre aperçus, les liens et le mode sans WebGL.
8. Après cette première publication vérifiée, activer les déclenchements push sur main de pages-controlled.yml pour obtenir des mises à jour automatiques **contrôlées**. Tant que le workflow n'a qu'un déclenchement manuel, chaque publication requiert un lancement manuel.

**Ne jamais effectuer l'étape 4 sans pouvoir réaliser les étapes 5–7.**
Le changement de source seul ne déclenche pas un nouveau déploiement : il peut geler la version visible.

## Si la publication contrôlée échoue

- Ne pas contourner les tests en publiant tout le dépôt.
- Laisser l'ancienne version publique en place si possible ; si nécessaire, remettre temporairement **Deploy from a branch / main** pour retrouver le mode antérieur, puis diagnostiquer l'échec.
- Inspecter les logs du job exact : problème de fichiers manquants, secrets apparents, URL cassée, droits Pages, défaut de rendu du marqueur SHA.
- Après correction, relancer uniquement un workflow basé sur main et vérifier le site réel.

## Point essentiel : confidentialité

Exclure un chemin de GitHub Pages ne rend **pas** le code ni les fichiers privés dans le dépôt public cosscoll/IAgile. Des fichiers pédagogiques véritablement réservés aux clients doivent vivre dans un dépôt **privé**, une base de données avec contrôles d'autorisation côté serveur et/ou un stockage privé. Même une suppression ultérieure ne supprime pas automatiquement les anciennes versions de l'historique Git public.

Aucun fichier contenant cours payants, corrigés, jetons, clés privées, identifiants ou données d'apprenants ne doit être commité dans ce dépôt public.

## Critère de fin

Le déploiement n'est **pas** considéré achevé à la seule réussite du commit ou du job. Il faut confirmer l'adresse publique https://cosscoll.github.io/IAgile/, le SHA, les contenus visibles et les chemins sensibles non accessibles, puis faire les tests mobiles réels.
