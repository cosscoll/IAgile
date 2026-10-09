# IAgile — Activation du chatbot intelligent

## Statut
Le site public conserve le chatbot guidé tant que `chat-config.js` comporte `endpoint: ''`. La présence du code serveur dans GitHub ne signifie pas que l'IA est opérationnelle. Aucun secret n'est requis pour GitHub Pages.

## Architecture
- GitHub Pages : `chatbot.js`, `chat-config.js`, `chatbot-ai.js`, `chatbot.css`.
- Vercel : fonction Node `api/chat.js` hébergée côté serveur. La clé OpenAI n'apparaît jamais dans le navigateur.
- OpenAI : Responses API, `store:false`. Le navigateur fournit les derniers messages au serveur, sans historique persistant dans une base. Le fournisseur API peut appliquer ses propres durées de conservation.
- La base de réponses contient **uniquement** les quatre aperçus commerciaux publics. Aucun cours complet ni document pédagogique privé n'est intégré.

## Activation
1. Dans Vercel, connecter le dépôt `cosscoll/IAgile` et déployer la racine contenant `api/chat.js`.
2. Définir **dans Vercel** la variable d'environnement secrète `OPENAI_API_KEY`. Facultatif : `OPENAI_MODEL` (par défaut `gpt-4.1-mini`), `CHAT_ALLOWED_ORIGIN=https://cosscoll.github.io`.
3. Vérifier `https://<nom-de-projet>.vercel.app/api/chat` par GET. Il doit retourner `{"ready":true,"generative":true}`. Vérifier ensuite une requête POST avec un test réel.
4. Définir l'URL publique HTTPS du backend dans `chat-config.js` : `endpoint: 'https://<nom-de-projet>.vercel.app/api/chat'`. Ne **jamais** mettre la clé API dans ce fichier.
5. Publier sur GitHub Pages, tester depuis l'accueil et chaque page de formation, sur mobile et au clavier. Un POST doit produire une réponse générée cohérente, sans inventer de tarif ni divulguer de contenus payants.
6. Avant exposition au trafic : configurer un quota de dépenses API, une limitation de requêtes durable / WAF côté hébergeur et une information de confidentialité sur l'envoi des questions à un service IA externe. La limitation en mémoire de la fonction Node n'est pas globale et ne suffit pas contre l'abus.

## Désactivation rapide
Remettre `endpoint: ''` dans `chat-config.js` et publier : le chatbot guidé revient automatiquement sans casser le reste du site.

## Tests
`npm test` sur Node 20+. Le test de réponse générative utilise une simulation d'OpenAI et **ne valide pas une connexion réelle** sans clé ni backend hébergé.

## Consignes métier
Pas de tarifs ou de dates inventés. Pas d'inscription annoncée comme active. Pas de conservation en base des conversations prévue. Aucun cours, exercice corrigé, bibliothèque de prompts réservée ou accès à des contenus de formation privés.
