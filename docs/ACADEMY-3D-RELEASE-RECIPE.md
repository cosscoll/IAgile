# IAgile — Recette d'un site 3D réellement utilisable

**Statut : grille exécutable de validation, pas certification automatique.** L'outil traite des déclarations de tests et ne visite pas de site : la vérification publique et les essais sur appareils réels sont une étape séparée.

## Les 13 critères

1. `html-fallback` — contenu essentiel accessible sans moteur WebGL.
2. `keyboard-navigation` — navigation utilisable par Tab / Entrée, sans piège clavier.
3. `visible-focus` — focus visible, ordre prévisible.
4. `reduced-motion` — préférence de mouvement réduit respectée.
5. `mobile-320` — pas de débordement horizontal à 320 px.
6. `mobile-375` — navigation et contenus utilisables à 375 px.
7. `no-webgl` — aucun écran vide lorsque le GPU n'est pas disponible.
8. `camera-geometry` — pas de traversée des murs, trous ou tunnels.
9. `camera-direction` — rotations et transitions prévisibles.
10. `direct-navigation` — pas de détour très long lors d'un clic sur le menu.
11. `gpu-memory` — libération des ressources lors des changements de scène.
12. `performance` — temps d'affichage et stabilité **mesurés** sur appareil réel.
13. `public-version` — URL HTTPS, version déployée et méthode de retour arrière vérifiées.

Cette grille reprend les risques documentés dans l'étude IAgile, mais elle ne promet ni des FPS garantis ni une compatibilité universelle WebGPU/WebGL.

## Mode d'emploi

Après une recette réalisée sur une version et un appareil identifiés, enregistrer les observations **sans nom personnel ni token** dans un fichier JSON local hors GitHub :

```json
[
  {
    "id": "mobile-320",
    "status": "passed",
    "evidence": "Simulation pédagogique uniquement : test de débordement revu.",
    "device": "synthetic-device",
    "browser": "synthetic-browser"
  },
  {
    "id": "performance",
    "status": "not-tested"
  }
]
```

Attention : cet exemple JSON est **fictif** et ne vaut pas preuve de test. Les autres critères absents sont automatiquement `not-tested`.

```bash
node tests/academy-3d-readiness.test.mjs
node scripts/academy-3d-readiness.mjs /chemin-prive/recette-3d.json
```

La commande produit :
- `not-fully-tested` : observations manquantes ;
- `self-reported-failures` : au moins un critère signalé en échec ;
- `self-reported-ready-for-independent-review` : tous les critères **déclarés** réussis, à contrôler indépendamment avant publication.

Le programme retourne un code non nul lorsque des critères ne sont pas terminés. Même si tous les critères sont déclarés réussis, **il ne prouve pas qu'un navigateur ou un humain a réellement effectué ces essais**.

## Démonstration pratique en cours

Tester volontairement un parcours où la caméra traverse une paroi, puis corriger le trajet ; renseigner l'état du contrôle `camera-geometry`. Faire la même chose en désactivant WebGL et en choisissant l'option de mouvement réduit. Mettre à jour le registre uniquement après observation réelle. Éviter les captures contenant des données personnelles ou des identifiants de session.

## Critères de publication future

Un élève IAgile doit pouvoir expliquer ce qu'il a testé, sur quel appareil, quel navigateur, avec quel résultat, et comment restaurer une version précédente. Le formateur contrôle ces preuves et peut refuser la validation si les observations ne sont pas reproductibles.

Suivi : [GitHub #59](https://github.com/cosscoll/IAgile/issues/59). Pour le dépôt vitrine public, la page principale n'est jamais déclarée mise à jour sans preuve de disponibilité de l'URL publiée.
