# Academy — procédure d'import des 12 supports privés (V0.9.1 CANDIDAT)

**Statut : non autorisé / non exécuté.** Ce document et le script ne publient pas de contenu premium et n'activent ni commande, ni paiement.

## Préconditions non négociables

1. Validation éditoriale humaine explicite de V0.9.1 (les SHA-256 sont différents de l'ancien registre `v0.1`).
2. Séparation stricte des packs : n'utiliser que l'archive **apprenant** `IAgile_Processus_V091_CANDIDAT_Apprenant_PRIVE.zip`. Le ZIP corrigé formateur doit rester hors de ce transfert.
3. Vérifier les 12 données fictives et leurs corrections ; aucune URL ni donnée réelle personnelle dans les jeux de données.
4. Sur le compte administrateur : bucket Supabase `iagile-course-files` privé, MIME CSV/Markdown, limite 50 Ko, aucun réglage public. Utiliser un environnement d'opérateur privé et un compte habilité. Ne **jamais** transmettre de clé `service_role` à ChatGPT, GitHub, une page web ou un journal.
5. Ne modifier ni `published`, ni inscription, ni prix à cette étape.

## Essai hors ligne — aucun réseau, aucune clé

Extraire dans un dossier privé les fichiers `datasets/` et `manifest_v091_candidate.json` du **ZIP apprenant**. Le dépôt GitHub ne doit jamais recevoir ces fichiers.

Depuis un clone du dépôt, exécuter :

```bash
node scripts/upload-approved-course-assets.mjs /chemin-prive/manifest_v091_candidate.json /chemin-prive/datasets processus
```

Le script réalise le même contrôle local que `verify-private-course-assets.mjs` et affiche le SHA-256 du manifeste. Sans option d'exécution, **aucune requête HTTP** n'est réalisée.

## Import administratif, après validation éditoriale uniquement

L'opérateur configure dans son environnement local (jamais en ligne de commande partagée, logs ou dépôt) :
- `IAGILE_SUPABASE_URL` — URL du projet Supabase IAgile prévue, HTTPS obligatoire.
- `IAGILE_SUPABASE_SERVICE_ROLE_KEY` — identifiant serveur strictement privé, jamais la clé publique du navigateur.
- `IAGILE_APPROVED_MANIFEST_SHA256` — empreinte exacte du manifeste **approuvé**, issue de l'essai hors ligne.

Puis l'opérateur utilise le même appel en ajoutant `--execute-after-editorial-signoff`. Sans cet indicateur **et** l'empreinte validée, l'import n'a pas lieu.

La procédure vérifie la configuration du bucket par l'API avant toute lecture/écriture, charge chaque fichier sans écrasement, relit chaque objet privé par une requête authentifiée, et recalcule taille et SHA-256. Une deuxième exécution saute les fichiers déjà présents **uniquement si leurs octets sont identiques**. Une anomalie arrête le traitement. Un import partiel ne déclenche aucune suppression automatique et ne modifie pas le registre.

## Validation distante finale / publication toujours interdite

- Contrôler sur Supabase **12/12 chemins exacts** et recalculer indépendamment les 12 SHA-256 sur des copies téléchargées, non sur la seule table `storage.objects`.
- **Après seulement** les preuves d'octets et l'approbation pédagogique, utiliser le SQL de garde privé `apply_metadata_AFTER_verified_upload.sql` de l'archive de préparation, en vérifiant préalablement ses préconditions. Il maintient `published=false`.
- Auth/RLS : essayer un visiteur anonyme, deux apprenants aux inscriptions différentes, un formateur autorisé, un compte suspendu et l'expiration d'un lien signé.
- Décider distinctement de la publication des leçons et supports, de la disponibilité commerciale, du contrat, de la TVA et du système de paiement. **Aucun GO commercial automatique.**

## Tests

`node tests/academy-private-upload.test.mjs` simule localement : dry-run, manifeste incorrect, bucket devenu public, accès refusé, objets déjà présents, import idempotent, octets distants altérés, preuve de 12/12 fichiers et détection d'un fichier local falsifié. Aucun test n'utilise une véritable clé ni le réseau.

**Limitation** : l'outil utilise les points d'accès Storage REST standards de Supabase. Son exécution authentifiée dans l'infrastructure réelle n'a pas encore été effectuée. Aucun ordre ou ticket de support n'est créé par ce script.
