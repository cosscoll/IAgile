# IAgile Academy — inventaire source de vérité

## Correction du 9 octobre 2026

Les programmes pédagogiques complets existent **déjà dans Google Drive**. Cette feuille de route initiale est un canevas technique et **ne remplace pas** les programmes officiels. Ne pas la traiter comme une demande de rédiger 38 nouveaux modules. La priorité est désormais de reprendre les contenus validés, les laboratoires et les supports privés, puis de les livrer via l'espace apprenant sécurisé.

Programmes de référence :
- Sites 3D : https://docs.google.com/document/d/1Oun1Fj_hA2qy8K1T5B16tq4VM375SAA_3NqlUV7Wofw/edit
- Agents : https://docs.google.com/document/d/1-Bg73cjf2bSOacK4IL_tyyNPc2KO34_CnwQ8m4y8ju0/edit
- Automatisation : https://docs.google.com/document/d/1OKCmqifHvknfq4fKiqAbUbM7cI7llwlNq7ynpoqyi1o/edit
- Plan directeur : https://docs.google.com/document/d/1q0QmR8OsVqsENxJz5WsP1TAFrSOIinh9YgRtO1D-GGI/edit

Distinction : **contenu produit dans Drive** ne signifie pas **contenu intégré à Supabase**. Au 11/10/2026, l'Academy contient les 47 emplacements de modules répartis entre les quatre formations, tous non publiés. La majorité des trois parcours techniques sont encore des ébauches courtes et non des leçons prêtes à suivre. Les supports existants n'ont pas été copiés dans ce dépôt public.

### Priorités corrigées
1. QA réelle du laboratoire n8n, du SDK agents et du starter 3D, plutôt que recréer le programme.
2. Intégration protégée des ressources Drive dans un espace apprenant, une fois le pipeline d'import fiable.
3. Authentification, permissions, progression, quiz, livrables et évaluations.
4. Pilote avec utilisateurs quand cela devient possible, sans prétendre disposer de retours aujourd'hui.
5. Contrôle anti-divulgation des supports premium, publication et suivi des versions.

---

# IAgile Academy — feuille de route pédagogique

État vérifié au 11 octobre 2026 : quatre parcours enregistrés et masqués, 47 modules en base (9 processus, 11 automatisation, 12 agents, 15 sites 3D), tous non publiés. L'intégration de contenus pédagogiques approfondis reste à achever pour les trois parcours techniques. Aucun contenu premium n'est publié.

## Sites web 3D — 15 modules prévus
1. Brief et expérience cible
2. Fondations HTML, CSS et JavaScript
3. Architecture d'une page immersive
4. Fondamentaux 3D et repères spatiaux
5. Première scène Three.js
6. Caméra et interactions
7. Géométrie, matériaux et lumières
8. Animation et GSAP
9. Assets 3D, Blender et optimisation
10. Navigation spatiale et transitions continues
11. Interfaces superposées accessibles
12. Performance mobile et progressive enhancement
13. SEO et alternatives au canvas
14. Tests, stabilité et correction de bugs
15. Publication, mesure et démonstration finale

Projet de sortie : expérience 3D publiée, navigable, compatible mobile, avec alternative accessible.

## Agents personnalisés — 12 modules prévus
1. Identifier une mission utile
2. Cadrer le rôle et les limites
3. Concevoir les instructions
4. Préparer les sources de connaissance
5. Tester la pertinence des réponses
6. Connecter des outils à permissions minimales
7. Orchestrer les étapes de travail
8. Ajouter validation et supervision humaines
9. Traiter les erreurs et incertitudes
10. Sécuriser les accès et données
11. Évaluer les résultats et les coûts
12. Livrer, documenter et maintenir l'agent

Projet de sortie : agent spécialisé évalué, documenté et à actions contrôlées.

## Automatiser une tâche fastidieuse — 11 modules prévus
1. Choisir et mesurer une tâche
2. Cartographier l'existant
3. Définir déclencheurs, données et résultats
4. Construire le premier workflow
5. Connecter des outils
6. Contrôler les données
7. Ajouter des conditions de branchement
8. Gérer erreurs, reprises et doublons
9. Superviser les exécutions
10. Sécuriser et documenter
11. Mettre en production et mesurer le gain

Projet de sortie : automatisation supervisable, testée avec des cas d'échec.

## Règles d'intégration

Les titres ci-dessus sont une architecture de travail, non des leçons finalisées. Les modules doivent comporter une compétence observable, une mise en pratique guidée, une évaluation, une correction, une grille de réussite et une variante accessible. Réviser tout contenu face aux évolutions des outils avant diffusion. Les leçons restent non publiées jusqu'à validation et doivent être insérées uniquement dans le projet Supabase IAgile Academy existant.

## Contrôle qualité avant ouverture

Vérifier une connexion apprenant, l'accès à une seule formation, le refus des trois autres, la progression, les travaux remis, les contrôles formateur, les téléchargements privés, les erreurs réseau et le mobile. La vitrine ne doit jamais contenir les ressources réservées.


## Audit quantitatif vérifié sur Supabase — 11 octobre 2026

| Formation | Modules en base | Modules courts (< 500 caractères) | Publiés |
| --- | ---: | ---: | ---: |
| Agents | 12 | 11 | 0 |
| Automatisation | 11 | 10 | 0 |
| Processus du quotidien | 9 | 0 | 0 |
| Sites 3D | 15 | 14 | 0 |
| **Total** | **47** | **35** | **0** |

Une longueur inférieure à 500 caractères est un indicateur de manque de substance, **pas** une mesure complète de qualité. Les documents Google Drive contiennent programmes, travaux intégrés et labs, mais leur présence ne garantit pas que chaque module de l'espace apprenant soit finalisé ni évalué.

Autres données vérifiées : 14 consignes de livrables (2 agents, 2 automatisation, 8 processus, 2 sites 3D), 12 références de ressources toutes dans processus, **zéro objet de cours dans le bucket privé**, zéro inscription, zéro profil apprenant. Les 10 tables comportent RLS activée et les vérifications Supabase ne remontent aucune alerte sécurité, sans remplacer des tests de comptes distincts.

### Conséquence pour la production

1. Ne pas activer les colonnes « published » ni vendre une formation sur la seule base des 47 enregistrements.
2. Reprendre les ressources déjà produites dans Drive, compléter chaque module au format pédagogique défini dans le plan directeur, puis valider exercices, corrigés, livrables et connaissances actuelles.
3. Importer les fichiers dans le bucket privé avec contrôles côté serveur et références cohérentes ; la simple présence de 12 lignes de registre ne signifie pas que les supports existent dans Storage.
4. Installer l'interface authentifiée et tester l'isolation entre deux apprenants avant tout contenu premium.
5. Conserver le dépôt public GitHub exclusivement pour les aperçus et le code non confidentiel, jamais pour les supports réservés.


## Contrôle structurel des contenus — 15 octobre 2026

Lecture croisée du programme de référence Google Drive, des titres de modules Supabase et du suivi des livrables.

| Parcours | Modules en base | Livrables associés | Constat |
| --- | ---: | ---: | --- |
| Agents personnalisés | 12 | 13 | Les 12 intitulés et leur ordre reprennent le programme de référence Drive. |
| Automatisation | 11 | 12 | Les 11 intitulés et leur ordre reprennent le programme de référence Drive. |
| Sites web 3D | 15 | 16 | Les 15 intitulés et leur ordre reprennent le programme de référence Drive. |
| Processus | 9 | 9 | Structure en base inventoriée ; programme maître Processus à contrôler séparément sur le document de référence propre au parcours. |
| **Total** | **47** | **50** | **Aucun module ni livrable publié.** |

**Observation qualitative ciblée :** des exemples de modules techniques (Agents #4, Automatisation #7, Sites 3D #8) montrent un résultat observable, un laboratoire, des cas de refus/panne, une épreuve et une grille de validation. Le module Processus #2 présente aussi un corpus fictif, une épreuve et des preuves. Un comptage du mot « exercice » ne constitue donc pas un audit de présence de pratique : les rubriques sont souvent nommées « lab », « défi » ou « épreuve ».

**Limite essentielle :** alignement des titres et présence d'une trame ne prouvent ni la durée réellement nécessaire, ni que les scripts, les projets et les assets ont été exécutés, ni l'efficacité de la pédagogie avec de vrais apprenants. Les modules restent volontairement non publiés. Les 50 livrables restent à contrôler dans leur articulation à la progression réelle.

**Chantiers de QA obligatoires :**
1. Comparer chaque module intégral à son programme Drive, notamment exemples, fiches pratiques et promesse de compétence.
2. Vérifier qu'un apprenant peut réaliser et prouver chaque compétence sans code, fichier ou réponse caché manquant.
3. Exécuter les labs techniques réels sur environnements isolés, sur plusieurs navigateurs et appareils lorsque pertinent.
4. Vérifier les rubriques de correction, les critères éliminatoires et leur traçabilité au travail rendu.
5. Effectuer un pilote avec des comptes réels, relever les incompréhensions, réviser les leçons, puis seulement envisager la publication.

Référence complémentaire : `docs/ACADEMY-REFERENCES-QA-20261015.md`, audit des sources et licences. Les références à des logiciels gratuits peuvent comporter des options payantes ; celles-ci ne doivent pas être présentées comme incluses gratuitement.
