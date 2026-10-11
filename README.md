# IAgile — Vitrine publique et Academy privée

Site de présentation : https://cosscoll.github.io/IAgile/

**État au 11 octobre 2026 : pré-lancement.** Aucun achat ni inscription payante n'est ouvert.

## Ce qui est public

- `index.html` : expérience immersive, quatre formations et mini-démonstrations.
- `formations/*.html` : aperçu de chaque parcours, jamais les leçons complètes.
- `parcours.html`, `a-propos.html`, `faq.html`, `ouverture.html` : orientation, informations et transparence.
- `ressources/index.html` : exercices gratuits et limités. Diagnostic Processus, Scorecard, démonstration locale, Incident Lab Automatisation, Agent Readiness, brief 3D. **Aucune collecte d'email** dans ces exercices.
- `chatbot.js` : assistant guidé local par défaut. Le chatbot génératif n'est pas activé en production ; son éventuel backend ne doit jamais exposer de secret dans GitHub Pages.

Les exercices gratuits sont des **aperçus**, pas des copies des modules payants.

## Architecture de l'Academy

Le portail unique IAgile Academy gérera les quatre formations avec une authentification commune et des droits distincts par parcours. Les leçons, travaux, retours et supports restent privés dans Supabase, contrôlés côté serveur.

**Branche de développement Academy :** [PR #12](https://github.com/cosscoll/IAgile/pull/12). Ce code n'est pas fusionné dans `main`, ni déployé comme Academy opérationnelle. Les fichiers privés et corrigés **ne doivent jamais être ajoutés à ce dépôt GitHub public, même sur une branche expérimentale**. Le répertoire `academy-private/` contient l'interface et les scripts de tests, pas les leçons.

Au 11 octobre : 47 modules structurés dont 12 leçons approfondies (9 Processus + 3 premières leçons des autres parcours), 14 consignes de travaux non publiées (8 Processus, 2 par autre parcours) ; zéro compte Auth et zéro fichier de cours effectivement téléversé dans le bucket privé. Trois modules approfondis sont aussi sauvegardés dans les programmes maîtres du Google Drive privé.

## Publication et contrôles

GitHub Pages est publié par **un seul** mécanisme, le workflow natif `pages build and deployment`. Le workflow `.github/workflows/deploy.yml` sert exclusivement de QA et vérifie les fichiers autorisés ; il ne déploie rien.

Le workflow `.github/workflows/verify-live-pages.yml` teste le site **réellement accessible**, notamment le SHA exact servi par l'accueil, les pages publiques et les chemins techniques interdits. Déclencheurs : push sur `main`, fin de déploiement Pages lorsqu'elle est disponible, vérification quotidienne et lancement manuel.

Dernière preuve de contrôle : [GitHub Actions, 11 octobre 2026](https://github.com/cosscoll/IAgile/actions/runs/38165219434) — SHA exact confirmé, 22 chemins publics HTTP 200, 12 chemins privés HTTP 404. Les tests CI ne remplacent pas un audit réel de performances mobiles et d'accessibilité avec lecteurs d'écran.

Pour la QA locale :
```sh
npm test
```
Les tests Chromium des exercices gratuits sont exécutés par `.github/workflows/verify-marketing.yml`.

## Retards et conditions de mise en marché

1. Héberger l'Academy sur un domaine/sous-domaine autorisé, avec comptes Auth pilotes et redirections email opérationnelles.
2. Téléverser et contrôler réellement les douze ressources privées, puis tester les droits de lecture, de suspension et de révocation avec plusieurs comptes.
3. Valider pédagogiquement le premier parcours auprès d'apprenants volontaires.
4. Définir vendeur, clientèle B2B/B2C, tarifs, TVA, conditions contractuelles, confidentialité, assistance et remboursement avant activation du paiement.
5. Configurer une mesure d'audience appropriée et un outil de collecte d'intérêt seulement après le choix d'un prestataire et d'informations de confidentialité fiables.

Le fichier `docs/ETAT-LANCEMENT.md` suit les décisions. Il n'existe actuellement aucun achat, liste d'attente ni newsletter fonctionnels sur le site.

**Sécurité :** le dépôt et tout son historique sont publics. Ne jamais y commiter de clé API, mot de passe, ZIP de supports premium, livrable apprenant ou corrigé.
