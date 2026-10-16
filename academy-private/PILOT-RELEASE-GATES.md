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

## Barrières de sécurité supplémentaires — testées le 10 octobre 2026

- **Règle côté base `academy_course_release_guard`** : l'ouverture d'une formation est interdite s'il manque un module publié, une consigne publiée ou un fichier référencé et effectivement disponible dans le bucket privé. Une tentative de publication du parcours Processus incomplet a été refusée. Test SQL transactionnel, aucune donnée conservée.
- **Contrôle de taille des données** : une réponse doit contenir de 1 à 10 000 caractères utiles, une note ne peut dépasser 4 000 caractères. Le timestamp initial d'une réponse est produit par le serveur. Test de refus des valeurs vides ou trop longues effectué en SQL.
- **Tableau de bord privé de lancement** : `academy_private.course_launch_readiness`, non autorisé à `anon` ou `authenticated`, agrège modules, travaux, ressources attendues et statut des fichiers. Les quatre formations ont `content_release_ready=false` au dernier contrôle.
- **Cloisonnement du navigateur** : lors d'une déconnexion ou d'un changement de session/cours, les leçons, documents et travaux déjà chargés sont retirés du DOM avant le chargement suivant. Les tests Chromium portent désormais sur la sortie apprenant et formateur.
- **Concordance de l'archive pédagogique** : les 12 fichiers du ZIP local ont été contrôlés contre leurs tailles et empreintes SHA-256 ; les 12 métadonnées correspondent à ces empreintes et tailles. L'archive ne figure pas dans le dépôt public.

### Interdiction de conclure à un lancement prêt

Une sécurité RLS correcte et des tests Chromium avec compte simulé **ne remplacent pas** l'envoi des fichiers dans Storage, les droits testés via Supabase Auth réel et une revue pédagogique humaine. Ne jamais passer les cours en `published=true` ni ouvrir les ventes tant que ces conditions ne sont pas documentées.
