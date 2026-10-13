# IAgile Academy — paiement, accès et remboursement (décision technique non active)

**Date : 13 octobre 2026 — état : PRELAUNCH, aucun checkout réel ni facture émise.**
Le module `scripts/academy-fulfillment-plan.mjs` n'est **pas** un webhook ou un serveur de paiement : il ne fait aucune écriture, ne crée aucun droit, n'active aucune offre et ne contacte pas Stripe. Le test `tests/academy-fulfillment-plan.test.mjs` construit uniquement des événements Stripe **fictifs** signés avec une clé de simulation.

## Contrats et garde-fous déjà codés

1. `scripts/stripe-signature.mjs` : refus d'un événement non signé, d'une signature expirée et d'un payload falsifié.
2. `scripts/academy-checkout-policy.mjs` : croisement événement signé, marchand, mode live/test, commande, compte, cours, montant, devise, session, statut `paid`, et contrôles de remboursement total vs partiel.
3. `academy_billing.record_checkout_payment` : procédure Supabase existante côté `service_role`, commande verrouillée, consentement contractuel présent, montant et identité cohérents, unicité de l'événement et état `paid` ; **n'attribue aucun accès**.
4. `scripts/academy-fulfillment-plan.mjs` : refuse de proposer un accès si marchand/offre ne sont pas approuvés, si le compte est suspendu, si le cours n'est pas publié, si un autre droit existe, ou si l'événement n'est pas valide. Si tout est conforme, la seule action produite est **`propose-manual-enrollment`**, jamais un insert.
5. Reversal : proposition d'examen humain des remboursements complets/litiges ; aucun retrait automatique, et les remboursements partiels sont bloqués pour revue contractuelle.

## Il reste à construire avant tout checkout réel

- Vendeur IAgile identifié légalement, TVA/reçu/facture validés, mode B2C ou B2B décidé, conditions de rétractation et remboursement validées.
- Produit et tarif approuvés, période d'accès et nature de l'accompagnement affichées.
- Compte marchand correspondant à IAgile confirmé ; environnement d'essai Stripe isolé des autres activités.
- API backend sécurisée créant le paiement **côté serveur** avec prix venant d'une table approuvée, jamais d'un montant envoyé par le navigateur.
- Endpoint webhook recevant les octets bruts, vérifiant signature, enregistrant événements idempotents et réconciliant la transaction avant **toute** attribution de droits. La fonction SQL actuelle enregistre le paiement mais ne délivre aucun accès.
- Migration serveur transactionnelle dédiée aux droits d'accès (éviter le « payé mais pas inscrit »), avec règles de suspension et de remboursement respectant le contrat.
- Facturation, e-mails transactionnels, numéro de facture, correction des données et service client.
- Scénarios bout à bout en mode test : échec, paiement réussi, webhook dupliqué, retard/désordre, autre utilisateur, mauvais cours, remboursement complet/partiel, litige, email non délivré, changement de version de l'offre.
- Audit de sécurité et de conformité pré-lancement avec utilisateurs pilotes.

**Décision de GO** : aucun paiement réel et aucune activation d'accès avant que chacune de ces preuves soit enregistrée dans `docs/IAgile-LAUNCH-EVIDENCE.json`.

## Commande de simulation

`node tests/academy-fulfillment-plan.test.mjs` ; aucune variable d'environnement, aucun secret, aucune connexion au processeur de paiement.
