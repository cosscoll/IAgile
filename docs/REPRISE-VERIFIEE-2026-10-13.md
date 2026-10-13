# IAgile — Reprise et vérification du 13 octobre 2026

**Statut : NO GO commercial.** Compte rendu factuel ; aucune activation de paiement, d'inscription ou de contenu premium.

## Vérifications effectuées en direct

- Dépôt GitHub `cosscoll/IAgile`, branche `main` : dernier commit observé `51305ae16c927cbb8b698d279222c10ef9df18d7` (clôture du sprint après UI formateur, simulation pilote, ledger paiement privé et contrôles de supports).
- Supabase IAgile Academy, projet existant `daabfmdlgcwcykevvrcm` : **47 modules, 0 module publié**, **15 consignes de livrables**, **0 profil**, **0 inscription** et **0 objet** dans le bucket `iagile-course-files`. Requêtes SQL SELECT exécutées séparément le 13 octobre 2026.
- Advisor sécurité Supabase : 2 avis informatifs `rls_enabled_no_policy` sur `academy_billing.orders` et `academy_billing.webhook_events`. Ces tables de facturation sont intentionnellement privées et sans policies client ; vérifier que seules les écritures serveur privilégiées nécessaires restent autorisées. Aucune conclusion de vulnérabilité à tirer du simple avis INFO. Référence : https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Catalogue Vercel : le projet `iagile-academy-staging` **existe** (ID `prj_bMiSXP3lGCrYPDtzkXAHBPMkXUOC`, équipe `team_S3CZCMukEO0dAG8QdpmXtabI`). Le catalogue expose aussi `iagile-chatbot`. Les lectures détaillées des projets et du listing de déploiements restent bloquées par **HTTP 403**, scope `procollomb-6607`. Il est donc incorrect d'affirmer que le staging est déployé, synchronisé ou exploitable.
- Le contrôle HTTP du site public **n'a pas été rejoué dans cette vérification**. La présence du dernier commit dans GitHub ne prouve pas sa visibilité actuelle sur GitHub Pages.

## Chantiers réellement prioritaires, dans cet ordre

1. **Débloquer la lecture et le déploiement du projet Vercel existant**, sans créer un deuxième staging à l'aveugle. Un opérateur autorisé doit reconnecter l'accès au scope `procollomb-6607` ou utiliser l'identité Vercel déjà autorisée. Revalider le projet, la branche Git, le répertoire racine `academy-app/`, la protection d'accès staging et les URL HTTPS effectives.
2. **Configurer Supabase Auth pour l'URL réelle de staging** seulement une fois l'hébergement vérifié. Préparer deux comptes apprenants de test séparés et un compte formateur, sans droits commerciaux et sans publication de cours complets.
3. **Tester les permissions de bout en bout** : refus anonyme ; formation non publiée ; apprenant A interdit sur la formation B ; accès croisé aux réponses, notes et progression refusé ; retours formateur périmés refusés ; désinscription et suspension ; déconnexion ; aucun contournement via URL privée.
4. **Réconcilier les douze ressources privées** : les manifestes candidats et anciens diffèrent ; ne pas forcer les imports. Obtenir les fichiers originaux validés, réviser leur intégrité, leur licence, leur version et leurs corrigés avant upload dans `iagile-course-files`. Rester à `published=false` pendant ces opérations.
5. **Valider pédagogiquement la formation pilote Processus / IA au quotidien** : neuf modules, exercices, preuves d'exécution, corrigés séparés et barèmes ; les tests simulés Chromium ne prouvent pas les essais des laboratoires avec de vrais outils ni les résultats de vrais apprenants.
6. **Préparer la vente sans l'activer** : identification du vendeur, offres et tarifs, mentions légales, CGV, confidentialité, remboursement, support, outil de paiement, vraie facture et tests de paiement serveur/webhook avec attribution de droit explicite après vérification.
7. **Vérifier chaque publication** par SHA, URL HTTP, navigateur desktop/mobile et contrôle de non-divulgation ; ne pas publier les ressources payantes dans le dépôt public GitHub.

## Critères minimums avant un GO commercial

Staging HTTPS fonctionnel et vérifié ; trois rôles de test réels et matrice RLS réussie ; supports réellement présents dans le stockage privé et téléchargements autorisés/refusés éprouvés ; formation pilote validée ; conformité et identité vendeuse approuvées ; paiement test confirmé avec idempotence, droits, facture et remboursement ; première vente autorisée explicitement. **Aucun de ces critères ne doit être déclaré acquis par extrapolation des tests simulés.**

## Risques immédiats

- Vercel 403 empêche de certifier les déploiements, même si le projet est listé.
- Stockage privé vide : aucun pack pédagogique premium téléchargeable aujourd'hui.
- Absence de vrais comptes : aucune preuve d'étanchéité multi-comptes en exploitation.
- La branche `main` reste une vitrine publique ; conserver le principe de zéro fichier premium dans toute l'histoire GitHub.

**Prochaine reprise :** partir de ce relevé, ne pas reconstruire les composants déjà codés et concentrer les efforts sur le staging accessible, les essais Auth/RLS réels et le corpus privé vérifié.


## Rectification opérationnelle le 13 octobre 2026

Le relevé précédent signalait encore un blocage 403 Vercel. Il est désormais **levé pour la lecture et le déploiement du projet** en omettant le scope d'équipe forcé qui provoquait le refus. Un projet de staging préexistant a été identifié, synchronisé manuellement avec les fichiers de l'Academy et redéployé deux fois pendant les corrections.

**Dernier staging vérifié :** projet `iagile-academy-staging`, déploiement Vercel `dpl_3eEPjQextu73VwJy8xEAN6FZ8b8r`, source des fichiers Academy au commit `69486bf0515f1a3e34e224c9f740b23cdefd77da`. Le listing de retour comporte les 12 fichiers attendus, dont interface apprenant et interface formateur. L'alias `https://iagile-academy-staging.vercel.app/` est affecté au déploiement `READY`. Protection Vercel SSO toujours activée pour tous les déploiements.

**Corrections GitHub fusionnées :** PR #45 (purge immédiate du contenu apprenant lors des changements de session, invalidation visuelle des corrections précédentes après nouvelle soumission) et PR #46 (déconnexion du formateur conservant les copies cachées en cas d'erreur). Les quatre workflows GitHub Actions sont passés sur chacune des deux PR avant fusion. La synchronisation Vercel reste manuelle : des commits de documentation postérieurs ne changent pas les fichiers de l'application déployée.

**Configuration Supabase contrôlée :** `academy-app/config.js` référence la bonne URL de projet et une clé publique active reconnue par Supabase. Les 47 modules restent non publiés et aucun paiement ni inscription n'a été ouvert. **Attention :** aucun test navigateur authentifié derrière SSO, aucune vérification complète HTTP du site privé ni aucun essai Auth/RLS multi-comptes ne sont encore acquis ; l'état commercial demeure NO GO. Les problèmes de versions des 12 jeux de données et de l'épreuve Rivage / Playbook restent à résoudre avant publication de ressources.
