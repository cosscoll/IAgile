# IAgile Academy — grille de recette du premier pilote (10 octobre 2026)

Statut : **pas prêt à accueillir des apprenants ni à ouvrir la vente**. Ce document décrit des preuves exigibles, pas des fonctionnalités prétendument livrées.

## Résultats vérifiés dans Supabase

| Gate | Mesure et preuve | Statut |
|---|---|---|
| Modules du parcours Processus | 9/9 rédigés avec prérequis, exercice/atelier, évaluation, livrable, réactivation J+14 | OK structurel |
| Exercices évaluables | 7/7 consignes avec critères explicites | OK structurel |
| Pièces mentionnées dans les cours | 12 références distinctes, 12/12 enregistrées avec taille et SHA-256 dans `academy_course_assets` | OK métadonnées |
| Octets hébergés dans le bucket privé | 0/12 | BLOQUANT |
| Publication des cours et supports | 0 module/10 consignes/12 actifs publiés | Protégés |
| Authentification réelle | 0 comptes Auth ; tests navigateur avec comptes fictifs simulés | BLOQUANT |
| Règles d'accès au niveau Postgres | Tests transactionnels réels A/B/formateur, suspension et révocation réussis | OK technique, à confirmer via API Auth |
| Correction des livrables | Retour lié à la version exacte ; refus d'une évaluation obsolète validé en SQL transactionnel | OK technique |
| Paywall et facturation | Aucun parcours transactionnel réalisé | BLOQUANT commercial |
| Pages publique | Un éditeur Pages natif, SHA public vérifié, 15 sources privées inaccessibles | OK périmètre testé |

## Import des 12 ressources pédagogiques

Le ZIP de préparation `IAgile_Pilote_Processus_Datasets_v01.zip` n'est **pas** hébergé dans GitHub, ni dans la vitrine, ni dans Supabase Storage. Ses 12 fichiers sont enregistrés comme brouillons de métadonnées, mais le bucket reste vide.

Le script `scripts/upload_private_pack.py` vérifie les empreintes SHA-256 et refuse tout contenu dont le chemin ou la longueur diffère du manifeste. Il n'upload **rien** sans `--upload` et ne contient aucun secret. L'identifiant du projet Supabase est public ; la clé de service, elle, doit rester hors du dépôt.

Exécution depuis un environnement local autorisé :
```bash
python3 academy-private/scripts/upload_private_pack.py /chemin/vers/IAgile_Pilote_Processus_Datasets_v01.zip
# Prévisualisation des 12 contrôles locaux uniquement
# Fournir SUPABASE_SERVICE_ROLE_KEY par un gestionnaire de secrets ou variable protégée
python3 academy-private/scripts/upload_private_pack.py /chemin/vers/IAgile_Pilote_Processus_Datasets_v01.zip --upload
```

Après upload, vérifier 12 objets réellement récupérables, dont SHA distant identique à la source, bucket `public=false`, et contrôle de l'accès refusé en anonyme. Ne rendre `published=true` qu'après le test complet de la formation.

Le connecteur Supabase actuellement disponible expose SQL/RLS/Edge Functions, **pas d'action native d'upload de fichiers Storage**. L'exécution du script avec clé de service n'a donc pas eu lieu ici. Ne pas confondre l'intégration du manifeste et la présence effective des fichiers.

## Recette utilisateur de bout en bout

1. Deux comptes apprenants et un compte formateur réellement créés via Supabase Auth, avec des droits distincts.
2. A suit uniquement Processus; B suit une autre formation; les lectures croisées échouent.
3. Connexion, déconnexion, récupération du mot de passe, token expiré, reprise d'un module et de ses notes.
4. Téléchargement signé d'un **vrai fichier** du bucket privé et refus anonyme; vérifier une URL expirée.
5. Dépôt d'un livrable, correction par le formateur, nouvelle version par l'apprenant, invalidation de la correction obsolète.
6. Désactivation de l'inscription et suspension du formateur — refus immédiat de lecture, confirmé via navigateur.
7. Support, accessibilité clavier, écran mobile, erreurs réseau et fichiers manquants.
8. Évaluation de la compétence d'apprentissage par l'épreuve finale ; corrigé privé et critères de réussite validés.
9. Prix, contrats, RGPD, paiement et délivrance d'accès approuvés avant toute commercialisation.

## Règles de sécurité

Aucun contenu pédagogique payant ni fichier test contenant des données réelles sur GitHub ou GitHub Pages. Les fichiers du pack sont intégralement fictifs mais réservés aux apprenants, et ne constituent ni validation humaine ni preuve d'une plateforme prête.
