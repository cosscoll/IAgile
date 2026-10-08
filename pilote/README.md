# IAgile Learning Lab — V18

Pilote pédagogique, non indexé et sans compte utilisateur.

## Portée
- `index.html`, `pilote.css`, `pilote.js` : V17 inchangée fonctionnellement (défi 15 min, modules 0–1, Playbook), avec liens vers V18.
- `continuer.html`, `continuer.css`, `continuer.js` : modules 2 à 8, ateliers guidés, instructions copiables, auto-vérification, progression locale, export Markdown et JSON, import, réinitialisation.
- `modules-v18.json` : correspondance des ateliers avec les modules pour tests.

## Limitations volontairement explicites
- Aucun paiement, compte, IA générative ou notation pédagogique automatique.
- L'auto-validation ne signifie pas que la compétence est acquise.
- Le projet final doit être revu par une personne. La dernière grille de validation indique 80/100 avec un minimum 12/20 en fiabilité ; un autre document interne mentionne 70/100, à harmoniser.
- Ne pas saisir de données confidentielles dans les ateliers. Les données sont conservées seulement dans `localStorage` sur cet appareil, et exportables en JSON et Markdown.
- Le stockage V17 et V18 est séparé afin de préserver les données des utilisateurs V17 existants. Pour changer de navigateur, exporter les deux sauvegardes.
- L'accès par URL étant public, le pilote ne contient aucun contenu contractuellement protégé ni donnée client. `noindex` n'est pas une mesure d'authentification.

## Contrôle local
Servir le dossier parent avec `python -m http.server` puis ouvrir `/pilote/` et `/pilote/continuer.html`. Valider navigation, édition/annulation du statut, export/import, mobile et clavier.
