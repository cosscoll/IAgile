# IAgile — CHROME V21

Site public : https://cosscoll.github.io/IAgile/

## État actuel

Site vitrine en pré-lancement, pas de vente ouverte. Les quatre parcours disposent d'un aperçu commercial : sites web 3D, agents personnalisés, automatisation, IA au quotidien. La présentation immersive d’origine est conservée.

## Pages

- `index.html` : 5 scènes immersives, 4 formations, simulations et chatbot guidé.
- `formations/*.html` : aperçu commercial, public cible et résultat visé ; leçons réservées à des sites distincts.
- `parcours.html` : orientation interactive, comparaison et export texte sans collecte.
- `a-propos.html` : présentation du projet et état honnête du développement.
- `faq.html` : réponses actualisées aux questions des futurs apprenants.
- `404.html` : page de secours.

## Important : distinction chatbot

`chatbot.js` utilise par défaut l'assistant guidé local. `chatbot-ai.js` et `backend-iagile/api/chat.js` forment la version générative à activer après déploiement d'un backend sécurisé et configuration de `chat-config.js`. Ne jamais publier les clés API dans ce dépôt. Voir `docs/CHATBOT-IA-DEPLOIEMENT.md`. Tant que le serveur n'est pas activé, le site conserve son assistant guidé.

## Tests

Exécuter `node tests/site-check.mjs` pour valider les fichiers, métadonnées, ancres et liens locaux. Un parcours navigateur doit vérifier le desktop, le mobile et le rendu WebGL matériel.

## Déploiement

GitHub Pages, branche `main`. Éviter les publications concurrentes depuis plusieurs workflows.

## Blocages commerciaux

Voir `docs/ETAT-LANCEMENT.md`. Tant que le vendeur, l'offre, la conformité, la livraison pédagogique et les paiements ne sont pas validés, aucune inscription payante ne doit être activée.

## Répartition vitrine / plateformes de formation

- `index.html`, `parcours.html` et les quatre pages sous `formations/` constituent uniquement **la vitrine publique** : bénéfices, résultat visé et très courts aperçus.
- Chaque formation aura **son propre site d'apprentissage dédié**, avec accès réservé aux apprenants inscrits ; aucun des quatre sites privés n'est encore connecté.
- Les leçons détaillées, ateliers, exercices corrigés, évaluations, modèles et projets complets **ne doivent pas être publiés dans ce dépôt GitHub public ni dans GitHub Pages**.
- Le contenu de formation doit être stocké dans un dépôt privé et livré via une plateforme avec contrôle d'accès **côté serveur** après inscription/paiement. Un masquage HTML ou JavaScript ne protège pas les fichiers.
- Le dossier `pilote/` contient exclusivement un aperçu commercial limité ; les anciennes versions pédagogiques V17/V18 restent visibles dans l'historique de ce dépôt public et ne doivent pas être considérées comme privées.
- Les prix, modalités de vente et ouvertures d'inscriptions restent à valider.

## Mise à jour V21 (9 octobre 2026)

- V20 et V19 responsive intégrées à la V21 : parcours commercial, démonstrations courtes, liens directs vers les formations et transparence sur l'ouverture.
- Préservation des cas de pratique ajoutés à la branche principale le 9 octobre, sans fournir les méthodes complètes.
- La publication native GitHub Pages utilise Jekyll et les exclusions définies dans `_config.yml`. La liste d’autorisation du workflow CI sert au contrôle d’un répertoire de test `public-site/` et **n’est pas** le mécanisme de publication actif.
- Les données juridiques, le contact réel et la validation de marque restent à finaliser avant commercialisation.
- Le dépôt reste public, y compris l'historique des anciennes ressources pédagogiques.

## Qualité des déploiements — 9 octobre 2026

- Le workflow personnalisé `Deploy IAgile CHROME vitrine` vérifie le code **avant son propre déploiement** via `node tests/site-check.mjs` et `node --check` sur les scripts principaux.
- Le contrôle inspecte les pages, les ancres, le sitemap, les quatre aperçus des formations et la liste explicite des seuls actifs autorisés à être publiés.
- Ces vérifications ne remplacent **pas** les tests visuels, mobiles, GPU ni les tests de parcours de conversion effectués dans un navigateur réel.

**Publication actuelle :** GitHub Pages déploie nativement depuis la branche `main` avec Jekyll. Le workflow `.github/workflows/deploy.yml` réalise uniquement de la QA ; il **ne bloque pas** la publication native en cas d’échec. `_config.yml` exclut les sources internes et `tests/jekyll-boundary.test.mjs` vérifie la couverture de ces exclusions. Toute création ou modification de fichier nécessite une vérification des exclusions, des tests et du site public. Pour rendre les tests bloquants, il faudra basculer vers un workflow GitHub Actions de déploiement contrôlé et changer **ensemble** les paramètres Pages ; ne pas modifier la source Pages isolément, sous peine d’interrompre le site.


## Chantier de fiabilisation — 11 octobre 2026

- En-têtes HTML des quatre pages formation nettoyés (fermetures interdites des balises meta/link supprimées).
- Nouveau constructeur explicite de site publiable : `node scripts/build-public.mjs <SHA_COMMIT>` ; contrôle des fichiers et liens de l'artefact : `node tests/publication-boundary.test.mjs public-site` et `node tests/staged-public.test.mjs <SHA_COMMIT>`.
- La QA native continue ; le workflow `.github/workflows/pages-controlled.yml` est préparé pour la migration, **déclenchable manuellement uniquement après sélection de Source = GitHub Actions dans GitHub Pages**. Ne pas confondre préparation et activation. Procédure : `docs/DEPLOIEMENT-CONTROLE.md`.
- L'Academy Supabase existe déjà, avec 10 tables protégées et 47 enregistrements de modules non publiés. La majorité des modules techniques sont encore des ébauches ; aucune mise en vente ni déploiement apprenant autorisé à ce stade. Suivi : `docs/ACADEMY-PLAN.md` et `docs/ACADEMY-CURRICULUM-ROADMAP.md`.
- Les contrôles de code et de stockage ne démontrent pas à eux seuls le rendu public effectif. Vérifier la production et la version SHA avant toute annonce de mise en ligne.


## Prototype technique Academy — 11 octobre 2026

Le répertoire `academy-app/` contient désormais une interface de travail **non publiée** : un tableau de bord et quatre routes de formation. Il utilise Supabase Auth pour la connexion par e-mail, puis consulte le profil, les inscriptions et les cours via les règles RLS. Aucune leçon payante n'est intégrée au dépôt. `tests/academy-shell.test.mjs` vérifie les garde-fous statiques et l'exclusion de l'application du site vitrine. Les tests réels multi-comptes, les URL de retour Auth, l'hébergement dédié et les contenus complets restent à réaliser. Voir `academy-app/README.md`.
