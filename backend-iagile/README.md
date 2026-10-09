# IAgile — Serveur du chatbot

Ce sous-dossier est le **Root Directory** à sélectionner lors de l'import GitHub dans Vercel.

Seul ce dossier est publié côté Vercel. Ne jamais déployer la racine complète du dépôt IAgile sur Vercel : elle contient des documents et fichiers de travail sans rapport avec ce serveur.

Route : `GET /api/chat` (état sans révéler de secret), `POST /api/chat` (conversation).

Variables serveur : `OPENAI_API_KEY` (obligatoire, confidentielle), `CHAT_ALLOWED_ORIGIN=https://cosscoll.github.io` (optionnelle, valeur par défaut identique), `OPENAI_MODEL` (optionnelle).

L'application ne doit pas être annoncée comme prête si la clé n'a pas été configurée et la route testée avec un message réel.
