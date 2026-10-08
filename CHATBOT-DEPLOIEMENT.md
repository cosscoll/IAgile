# IAgile — Chatbot IA génératif, version V15

Le fichier `api/chat.js` est une fonction Node pour Vercel. Le navigateur ne reçoit jamais la clé API. La conversation est envoyée avec un historique court à OpenAI via HTTPS avec `store:false` ; le serveur ne stocke pas de conversations dans une base. Le fournisseur API peut appliquer ses propres politiques de traitement/rétention.

## Activer le vrai chatbot

1. Connecter Vercel à ce dépôt GitHub et déployer la racine du projet (site statique + répertoire `api/`).
2. Ajouter `OPENAI_API_KEY` dans les variables d'environnement Vercel **côté serveur**, jamais dans `chat-config.js`.
3. Optionnel : `OPENAI_MODEL` (`gpt-4.1-mini` par défaut). `CHAT_ALLOWED_ORIGIN=https://cosscoll.github.io` autorise GitHub Pages ; plusieurs origines peuvent être séparées par une virgule, et l'URL de déploiement Vercel est autorisée automatiquement via `VERCEL_URL`.
4. Si le public reste sur GitHub Pages, modifier **uniquement l'URL publique** dans `chat-config.js` : `endpoint: 'https://NOM-DU-PROJET.vercel.app/api/chat'` ; les requêtes CORS sont limitées à `https://cosscoll.github.io`. Si le site migre entièrement sur Vercel, `endpoint: '/api/chat'`.
5. Vérifier `GET /api/chat` -> `{ready:true,generative:true}`, puis envoyer un POST JSON `{message:'J’aimerais créer un agent RH',history:[],page:'/IAgile/'}`. Tester une question de suivi et la page mobile.
6. Avant trafic public important : activer le rate limiting/WAF durable côté Vercel (le garde-fou en mémoire dans la fonction n'est pas global entre instances), fixer les plafonds de dépenses dans le tableau de bord du fournisseur API, contrôler les journaux et adapter la politique de confidentialité.

## Principes

- Pas de réponses automatiques par mot clé : chaque message est envoyé à un modèle génératif.
- Le prompt serveur contient les informations validées du Drive sur les quatre formations.
- Pas de prix, de durée ou de disponibilité inventés ; les inscriptions ne sont pas ouvertes.
- Aucun faux état « connecté » : si l'API est absente, le chatbot est explicitement non connecté.
- Aucun secret dans le HTML/CSS/JS public ni dans le dépôt.
- Les conversations restent en mémoire de l'onglet uniquement ; le service IA est externe.

## Test local

`npm test` (Node 20+). Le test simule une réponse de l'API OpenAI et vérifie les validations/erreurs sans clé réelle.
