# IAgile — Intégration marketing et acquisition

## État livré sur la branche feature/marketing-resources-funnel
- Ressources publiques sans compte : `ressources/index.html`
- Diagnostic IA : `ressources/diagnostic-ia.html` — Scorecard calculée localement et export .txt
- Incident Lab : `ressources/incident-lab.html` — scénario fictif et diagnostic commenté
- Agent Readiness : `ressources/agent-readiness.html` — checklist de conception
- Brief 3D : `ressources/brief-site-3d.html` — texte exportable localement
- Accès depuis les quatre pages `formations/*.html`; CSS des encarts isolé dans `ressources/promo.css`.
- Test sur pull request : `npm test`.

## Convention des liens de campagne
Pour les publications, utiliser la page de ressource spécifique avec des paramètres UTM stables, par exemple :
`?utm_source=linkedin&utm_medium=organic&utm_campaign=processus-quotidien&utm_content=diagnostic-scorecard`
N'inclure ni nom, ni email, ni autres données personnelles dans les paramètres UTM.

## Parcours réellement opérationnel sur la branche
Publication (lien à préparer) → exercice gratuit sans collecte → page de formation.
Aucune page d'inscription, séquence email ou commande n'est activée. Cette architecture est cohérente avec l'état de pré-lancement.

## Conditions nécessaires pour ajouter une inscription email
1. Choisir un prestataire d'envoi avec base de contacts, double opt-in si retenu, suppression et gestion des désinscriptions.
2. Configurer un endpoint sécurisé côté serveur : validation, protection contre les abus, journalisation minimale, secrets hors GitHub Pages.
3. Fournir avant collecte une information claire sur la finalité et le responsable, avec consentement séparé pour la prospection quand requis.
4. Associer la campagne et la formation au contact uniquement si cette donnée est utile et licitement traitée.
5. Tester les cas : succès, adresse invalide, double soumission, erreur réseau, désinscription, demande de suppression.
6. Brancher les six emails rédigés par formation seulement après validation des envois et de leur base légale.

## Mesure des campagnes — évènements à prévoir
- `resource_page_view` : ressource et source de campagne, sans identifiant personnel.
- `resource_started` : premier usage volontaire de l'exercice.
- `resource_completed` : calcul / diagnostic achevé, sans transmettre les réponses privées.
- `resource_exported` : export local volontaire.
- `training_cta_click` : passage vers la page formation.
- `email_opt_in_confirmed` : uniquement après création du système de collecte et confirmation réelle.

Les pages actuelles **n'envoient aucun de ces événements**. Choisir d'abord un outil analytics et la configuration de consentement appropriée ; ne pas présenter ce plan comme un tracking installé.

## Tests manuels avant fusion
- Mobile étroit et ordinateur ; zoom texte à 200 %, focus clavier, lecteurs d'écran lorsque possible.
- Scorecard avec champs vides, zéro, décimales et valeurs extrêmes.
- Export de fiche et impression PDF, y compris annulation.
- Checklist Agent : navigation clavier et messages de statut.
- Incident Lab : affichage du corrigé uniquement sur action volontaire.
- Vérifier les quatre liens des pages formations vers le hub et le retour vers les cours.
- Tester dans un navigateur réel, pas seulement avec le test statique Node.

## Mise en ligne
La branche actuelle n'est pas déployée sur GitHub Pages. La PR #1 est en brouillon ; sa fusion sur `main` déclenchera le workflow de déploiement existant. Ne fusionner qu'après validation des tests et des textes, et sans confondre pages gratuites en ligne et mise en vente des formations.
