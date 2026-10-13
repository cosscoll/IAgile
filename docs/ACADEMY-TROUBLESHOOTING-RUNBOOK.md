# IAgile — Centre de dépannage : utilisation et maintenance

Le centre `academy-app/depannage.html` regroupe **20 fiches génériques**, cinq pour chacune des formations :

- Processus : fausses confirmations, absence de sources, prompts trop vagues, données sensibles, reprise de contexte.
- Automatisation : JSON, 401, 429, faux succès 200, timeout 504 après possible écriture.
- Agents : permissions, outil indisponible, budgets/tours, instruction non fiable, boucle.
- Sites 3D : absence WebGL, overflow mobile, collisions caméra, mémoire GPU, réduction des animations.

## Utilisation par un apprenant

1. Choisir son parcours dans le filtre.
2. Saisir le symptôme (par exemple `401`, `camera`, `doublon`).
3. Lire d'abord la section **Vérification**, avant de modifier quoi que ce soit.
4. Essayer la piste de résolution sur un exemple fictif et autorisé.
5. Renseigner la **Preuve attendue** avec la sortie réellement observée ; si aucune preuve n'existe, inscrire `NON TESTÉ`.

L'interface n'envoie pas la requête à un moteur IA : la recherche est locale, lisible hors accès réseau lorsque les fichiers sont déjà chargés. Le contenu est créé par API DOM et `textContent`, pas par `innerHTML`.

## Limites

Chaque fiche est une méthode générique. Une cause proposée peut ne pas être la bonne pour une version ou une configuration particulière. Les erreurs HTTP se rapportent à une API réelle dont il faut toujours consulter la documentation actuelle ; une réponse 200 ne garantit pas automatiquement l'effet métier.

Ces fiches sont des teasers et des outils de première orientation, **pas les corrigés premium des cours**. Elles ne contiennent ni clés, ni copies d'apprenants, ni source de données clients, ni cas pédagogiques payants. Les exemples concrets, la correction personnalisée et les ressources complètes resteront derrière les contrôles d'accès de l'Academy.

## Politique de mise à jour

Un responsable de contenu peut modifier les fiches dans `academy-app/depannage-data.mjs`, puis lancer :

```bash
node tests/academy-troubleshooting.test.mjs
node tests/academy-troubleshooting-browser.test.mjs
node tests/academy-shell.test.mjs
```

Le test navigateur requiert Playwright et Chromium disponibles ; GitHub Actions l'exécute dans l'environnement CI. Vérifier la disponibilité d'une nouvelle version sur le **vrai** staging protégé avant de déclarer le centre accessible. Le simple merge GitHub ne prouve pas un déploiement Vercel.

## Critères d'amélioration

Prioriser les questions récurrentes remontées par les apprenants, mais ne collecter aucun secret ni donnée personnelle inutile dans un retour d'erreur. Chaque nouvelle fiche doit avoir un symptôme identifiable, une vérification observable, une piste réversible et une preuve de résultat ; si la solution dépend d'une version d'outil, ajouter cette précision ou refuser la généralisation.

Chantier : [GitHub #56](https://github.com/cosscoll/IAgile/issues/56). Statut : développé et testé en environnement simulé, tests d'utilisateurs et publication staging à vérifier.
