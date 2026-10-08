# IAgile — Inscription volontaire et mesure : contrat de mise en production

Statut : spécification prête à implémenter, AUCUNE collecte ni intégration email activée.
Périmètre : les 4 ressources gratuites, priorité campagne « Processus du quotidien ».
Branche : feature/marketing-resources-funnel — ne pas publier sans contrôle de bout en bout.

## Ce qui fonctionne sans service externe
Les mini-exercices fonctionnent librement, calculent localement et permettent l'export local. Une personne peut aller de la ressource à la formation sans fournir son email. Aucun résultat d'exercice ni réponse de formulaire ne doit être expédié automatiquement.

## Contrat minimal d'une future inscription
Le formulaire facultatif demandera une adresse email avec finalité décrite juste à côté (par exemple recevoir des conseils relatifs à la formation, si la finalité a été validée) ; aucun précochage de consentement, aucune condition pour accéder au mini-exercice. Un lien visible conduira à l'information de confidentialité effective. Fournir le responsable, finalité, base légale, durée, destinataires, droits, contact, et le fonctionnement des désinscriptions.

Le navigateur doit utiliser un POST HTTPS vers un service côté serveur. Les identifiants du fournisseur d'email restent sur le serveur, jamais dans le HTML/JS public. L'endpoint valide syntaxe, longueur et consentement; impose rate limiting et protection abus; évite les fuites dans URLs, journaux, analytics et erreurs; refuse le spam; gère les doublons et les re-soumissions de manière idempotente. CORS restreint aux domaines autorisés. Ne jamais considérer un succès technique comme une preuve du consentement si aucune trace adéquate n'a été enregistrée.

L'API renvoie une réponse neutre (confirmation par email ou instruction de vérifier sa boîte), y compris pour les adresses existantes afin de limiter l'énumération. Aucun e-mail de prospection ne part avant le consentement requis et une configuration vérifiée. Un email de confirmation et un email marketing ont des finalités différentes. Tester suppression, retrait de consentement et désinscription. Prévoir procédure incident et accès restreint aux données.

## Choix du prestataire — décisions à prendre
Prestataire email : non sélectionné (Brevo, ou autre après comparaison).
Hébergement et endpoint sécurisé : non sélectionnés.
Adresse d'expédition et domaine DKIM/SPF/DMARC : à confirmer.
Texte d'information vie privée, responsables et conservation : à vérifier.
Chemin de désinscription, gestion d'oppositions et emails de bienvenue : à valider.
Ne pas activer de champ d'email en façade avant disponibilité de ces éléments.

## Parcours d'acceptation avant publication
1. Ressource gratuite disponible sans inscription, sur téléphone, sans message trompeur.
2. Formulaire opt-in optionnel avec erreurs accessibles au clavier et lecteur d'écran.
3. Consentement requis explicite, traçable et séparé d'une simple acceptation de CGU.
4. Endpoint HTTPS valide email, limite les abus, n'expose ni secret ni existence d'un contact.
5. Sur nouvel opt-in, confirmation réelle reçue, lien valide, refus possible.
6. Doublon, formulaire incomplet, échec réseau : traitement non trompeur, sans envoi indésirable.
7. Lien de désinscription et suppression réellement fonctionnels, vérifiés sur adresse de test.
8. Aucun champ personnel en URL, analytics, paramètres UTM, logs visibles ou écran partagé.
9. Dashboard : événement confirmé uniquement après confirmation réelle, pas au clic sur un bouton.
10. Tests end-to-end en environnement de préproduction puis revue humaine avant diffusion.

## Dictionnaire d'événements candidat (non activé)
resource_page_view : page vue ; resource_started : interaction initiale ; resource_completed : diagnostic terminé ; resource_exported : export local ; training_cta_click : navigation vers formation ; email_opt_in_confirmed : enregistrement confirmé côté serveur.
Pour tous les événements : éviter contenu des exercices, email, adresses IP si non nécessaires, identifiants de navigation persistants par défaut. Définir la base légale, la politique de cookies/consentement et les paramètres de conservation avec l'outil finalement choisi.
Métriques prioritaires : début / vue ; fin / début ; clic formation / fin ; inscription confirmée / visite ; activité / inscription. Aucune de ces métriques n'est actuellement mesurée.

## Cadrage de la première campagne
Formation mise en avant : « Simplifier & soutenir les processus du quotidien ».
Ressource : ressources/diagnostic-ia.html. Message : l'IA ne fait gagner du temps que si la qualité et les corrections entrent dans le calcul.
Lien UTM d'essai : ?utm_source=linkedin&utm_medium=organic&utm_campaign=processus-quotidien&utm_content=scorecard-v1 .
Ce lien est un exemple d'URL, pas une publication.
Matériaux maîtres de campagne sur Google Drive : « Campagne pilote — Processus du quotidien — 6 semaines » ; « Campagne Processus — Contenus rédigés S1 + emails » ; « Campagne Processus — Publications S2 à S6 et emails de nurturing ». Ne pas dupliquer ces documents ; les utiliser à l'ouverture.
Statut diffusion : préparation seulement. Aucune publication, vente ni collecte déclenchée par cette branche.

## Livrables de démonstration prévus dans la branche
- `ressources/diagnostic-10-questions.html` : 10 réponses traitées localement, trois pistes d'exercices, avertissements confidentialité et sécurité, export explicite ; aucune prétention de notation IA.
- `ressources/demo-processus.html` : traitement réel de notes fictives, traçabilité par ligne, conservation des champs inconnus, avertissement sur les actions incomplètes ; aucun chiffre de temps fabriqué.
- `ressources/diagnostic-ia.html` : Scorecard de mesure réelle utilisée ensuite par l'apprenant.
- Capture de démonstration automatiquement générée pendant les tests sur mobile et ordinateur et déposée comme artefact GitHub Actions. Ce n'est pas encore une vidéo publicitaire produite/validée.
