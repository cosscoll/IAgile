# IAgile — Statut réel avant lancement

Dernière actualisation : 11 octobre 2026. Ce document est un suivi technique interne, **pas une promesse commerciale**.

## Vitrine GitHub Pages — publiée et vérifiée

La vitrine V21 présente quatre formations et un catalogue d'exercices gratuits : diagnostic Processus, Scorecard, démonstration interactive, Incident Lab, Agent Readiness, brief 3D. Aucun paiement, aucune collecte de contact et aucun accès à une leçon payante ne sont ouverts.

**Publication :** un unique éditeur GitHub Pages natif ; l'ancien workflow personnalisé ne fait que tester. L'audit indépendant [Actions #38165219434](https://github.com/cosscoll/IAgile/actions/runs/38165219434) a confirmé en direct le SHA GitHub, 22 URL publiques en HTTP 200 et 12 chemins internes en HTTP 404.

**Limitations :** pas d'audit mobile GPU/performance réel récent, pas de suivi Search Console ni de statistiques de conversion confirmés. Le chatbot est guidé et local ; le mode génératif requiert encore backend et secrets/configuration de production.

## Academy — plateforme en développement, NON publiée

- Code et tests dans la [PR #12](https://github.com/cosscoll/IAgile/pull/12), conservée en brouillon.
- Supabase IAgile Academy actif, 10 tables métier sous RLS, bucket `iagile-course-files` privé.
- 47 modules : 9 Processus aboutis en première rédaction + 3 modules 0 des autres parcours récemment approfondis + 35 trames courtes.
- 14 consignes de travaux : 8 Processus dont une épreuve finale inédite, 2 Automatisation, 2 Agents, 2 Sites 3D.
- Douze fichiers pédagogiques fictifs préparés, checksums enregistrés, **0 fichier réellement transféré dans Storage**.
- **0 compte Auth réel**, 0 inscription, 0 travaux d'apprenants enregistrés ; toute formation est `published=false`.
- Tests RLS SQL transactionnels et Chromium simulés réussis ; les vrais tests Auth/Storage multi-comptes restent à faire.
- Protection Storage : type CSV ou Markdown et taille <=50 Kio ; refus de publier si taille/type enregistrés incompatibles. Le hachage du contenu doit être vérifié indépendamment au moment de l'import.
- Diagnostic Supabase sécurité sans alerte ; deux index signalés comme inutilisés avant l'arrivée de trafic, à réévaluer plus tard.

## Réalisations de communication et acquisition

Les stratégies, études et campagnes sont documentées dans le Google Drive IAgile. Les quatre ressources gratuites autrefois sur une PR en brouillon ont été intégrées au site. Une ancienne [PR marketing #1](https://github.com/cosscoll/IAgile/pull/1) est fermée et remplacée.

**Pas d'emails captés ni de campagne mesurée.** Le plan de conversion, le tracking avec conditions de confidentialité et les séquences emails restent des spécifications.

## Bloquants avant pilote apprenant réel

1. Hébergement Academy distinct avec URL finale et redirections Supabase Auth.
2. Création sécurisée d'un compte formateur réel et de deux comptes apprenants de test.
3. Import des 12 supports, lecture des fichiers depuis Storage, refus anonyme et après suspension.
4. Réussite sur navigateur des parcours connexion → cours → progression → remise → correction → révision.
5. Relecture des modules et tests pédagogiques avec de véritables personnes, lorsqu'elles seront disponibles.

## Bloquants supplémentaires avant vente

- Identité du vendeur, prix, clientèle B2B/B2C, régime TVA, marque/nom de domaine, modalités contractuelles.
- CGV, mentions, confidentialité, conformité numérique et politique de support/remboursement validées pour le modèle retenu.
- Paiement côté serveur, facturation, confirmation contractuelle, webhook idempotent et attribution/révocation d'accès après événement vérifié.
- Mesure d'audience et éventuelle collecte d'intérêt avec base légale et preuve du consentement adaptées.

**Ordre de travail recommandé :** rendre Processus du quotidien utilisable en pilote fermé, mesurer ses résultats, finaliser l'offre, puis industrialiser les trois autres formations. Aucune publication payante ne doit contourner ces critères.
