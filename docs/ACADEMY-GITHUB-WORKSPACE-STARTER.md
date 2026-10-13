# IAgile — Démarrer un espace de travail GitHub, sans dossier vide

Le générateur prépare **en local** un dossier de travail cohérent pour chacune des quatre formations. Il crée des modèles génériques et **aucun contenu premium**. Il ne crée pas de dépôt GitHub à votre place, ne publie rien et n'accède pas à vos comptes.

## Choisir une formation

- `processus` : projet de processus et décisions vérifiables.
- `automatisation` : préparation d'un projet de workflow simulé.
- `agents` : cadrage des rôles, actions et vérifications.
- `sites-3d` : préparation de la recette web, navigation, performance et accessibilité.

## Création du dossier

Pré-requis : Node.js 20 ou plus, et un dossier parent déjà existant.

```bash
node scripts/create-academy-workspace.mjs processus ./mon-projet-ia
node scripts/create-academy-workspace.mjs automatisation ./mon-automatisation
node scripts/create-academy-workspace.mjs agents ./mon-agent
node scripts/create-academy-workspace.mjs sites-3d ./mon-site-3d
```

**Attention :** ces commandes créent de nouveaux dossiers. Si un dossier existe déjà, le générateur refuse de l'écraser.

Chaque résultat contient les huit fichiers suivants :

```
mon-projet-ia/
  README.md          ← consignes et objectif
  BRIEF.md           ← besoins, limites et résultat attendu
  DECISIONS.md       ← choix argumentés et alternatives
  SOURCES.md         ← références, provenance et incertitudes
  NEXT.md            ← reprise après interruption
  GITHUB.md          ← méthode de création du dépôt GitHub
  .gitignore         ← exclusions préventives de fichiers sensibles
  docs/
    TESTS.md         ← preuves de recette et résultats observés
```

## Envoyer le dossier dans votre compte GitHub

Le fichier `GITHUB.md` créé décrit deux chemins :

**Avec le site github.com :** créer un dépôt privé vide, puis utiliser les commandes de publication proposées pour ce dépôt, sans inventer de lien.

**Avec GitHub CLI :** après installation et authentification de `gh`, aller dans le dossier puis exécuter :

```bash
git init
git add README.md BRIEF.md DECISIONS.md SOURCES.md NEXT.md GITHUB.md docs/TESTS.md .gitignore
git commit -m "Initialiser mon projet"
gh repo create --private --source=. --remote=origin --push
```

Un utilisateur devra approuver l'authentification GitHub, choisir son nom de dépôt et vérifier le contenu réellement publié. Le générateur ne lit aucune clé, aucun token ou fichier de formation privée.

## Une méthode de suivi reproductible

Pour chaque modification : noter le changement dans DECISIONS.md, documenter la source, ajouter un cas de réussite et d'échec à docs/TESTS.md, conserver NEXT.md compréhensible par une nouvelle personne, créer une branche Git avant un changement significatif, puis contrôler le résultat réellement publié.

Ce kit **ne suffit pas à rendre un projet sûr ou opérationnel**. La sécurité, les accès, le déploiement et les tests de chaque application sont spécifiques au cas réel.

## Vérification automatique

```bash
node tests/academy-workspace-generator.test.mjs
```

Le test crée puis supprime des dossiers temporaires fictifs ; il confirme que quatre parcours sont disponibles, que la structure est complète, qu'un projet existant n'est pas écrasé et qu'aucun dépôt distant n'est créé.

Ressource liée au chantier [GitHub #56](https://github.com/cosscoll/IAgile/issues/56) et au centre de ressources. Les 100 prompts, corrections et modules de l'Academy ne sont pas inclus dans ce dépôt public.
