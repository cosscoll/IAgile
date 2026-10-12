# IAgile — Paiement : simulation signée, non exploitable commercialement

**Statut au 12 octobre 2026 : NO GO pour toute vente et toute attribution automatique d'accès.**

Ce lot fournit seulement :
- `scripts/stripe-signature.mjs` : vérification HMAC-SHA256 et horodatage de la charge brute d'événement Stripe, avec conservation en mémoire de l'identité des événements authentifiés.
- `scripts/academy-checkout-policy.mjs` : décisions purement calculées (`propose-grant`, `propose-revocation-review`, `propose-suspension-review`) à partir d'un événement précédemment vérifié et d'une commande canonique.
- `tests/academy-checkout-policy.test.mjs` : commandes et signatures **fictives** uniquement. Aucun webhook hébergé, aucune écriture sur Stripe ou Supabase, aucune transaction, facture, inscription ou remboursement.

Commande locale : `npm run qa:checkout-simulation`. Aucun paramètre marchand n'est nécessaire.

## Conditions techniques encore bloquantes

1. Identifier l'**entité vendeuse IAgile**, choisir le régime contractuel, fixer une vraie offre et le prix dans une source serveur. Ne pas réutiliser le compte Stripe test d'un autre projet.
2. Créer une application backend authentifiée, avec environnement isolé et secrets marchand dans les variables côté serveur uniquement.
3. Créer des commandes canoniques reliées à `auth.uid()`, prix figé et compte Stripe du vendeur. La session Checkout doit être créée uniquement par ce serveur. Le navigateur ne décide jamais du prix, du cours ou des droits.
4. Vérifier les événements via le **corps brut** avant toute analyse. Ne pas faire confiance au champ JSON `signatureVerified` : l'identité interne est conservée dans un `WeakSet` inaccessible par une modification de JSON. Le module refuse également un événement imité par simple copie.
5. Compléter le traitement sur serveur par un journal transactionnel durable avec contrainte `UNIQUE` sur l'événement Stripe et sur la combinaison type / objet concernée. La `Set` utilisée dans la simulation n'offre **aucune** idempotence entre serveurs ou redémarrages.
6. Faire correspondre un événement à l'ID du compte marchand, la commande enregistrée, la session, le client, le cours, le statut encaissé, la devise, le montant, le mode live/test et la révision des CGV. Les événements directs sans `account` Stripe doivent être traités explicitement par le backend qui connaît son compte, et non forcés avec une valeur de client.
7. Attribuer le seul accès acheté **après** la vérification de paiement et la finalisation contractuelle ; gérer les droits lors d'un remboursement ou d'une contestation conformément à la politique approuvée.
8. Effectuer un vrai achat test, les échecs et une rétractation simulée, avec deux comptes Auth et un test de facture, **avant** le moindre paiement réel.

## Portée précise

Une simulation signée valide des règles logiques, **pas** la comptabilité, l'exhaustivité des événements réels, la conformité du checkout, le routage réseau ni les fonctions d'inscription. Les statuts du registre `docs/IAgile-LAUNCH-EVIDENCE.json` restent `blocked` sur marchand, prix, paiement, facturation, remboursements et contrats.

Source technique : [Stripe — webhooks](https://docs.stripe.com/webhooks), [Stripe — fulfillment Checkout](https://docs.stripe.com/checkout/fulfillment).

## Fondation serveur Supabase — registre privé

Migration **déjà appliquée** dans le projet Supabase IAgile le 12 octobre 2026 :
`supabase/migrations/20261012_academy_billing_private_ledger.sql`.

- `academy_billing.orders` : commande liée à un utilisateur existant, une formation connue, un montant, une devise, une version contractuelle et un marchand explicite. Les références de session et d'intention de paiement sont uniques.
- `academy_billing.webhook_events` : journal avec identifiant d'événement unique, objet concerné, compte marchand, statut de traitement et lien éventuel avec une commande.
- Schéma **privé**, non exposé comme API client ; RLS activé sur les deux tables et droits supprimés pour `anon` et `authenticated`. Le rôle serveur `service_role` possède les droits nécessaires.
- Lecture après migration : **0 commande, 0 événement de paiement**, 0 inscription et 0 utilisateur à cette date.

Cette structure ne constitue pas un webhook fonctionnel. Il manque le vendeur approuvé, la tarification, les secrets marchand, un endpoint sécurisé, le contrôle de double exécution en transaction, l'attribution des droits d'apprentissage, l'émission de facture et la procédure réglementaire de remboursement. **Aucune session Checkout ni facture n'a été créée.**

Attention : la conservation des commandes doit être ajustée au régime de conservation comptable et RGPD choisi par l'entité vendeuse avant la première vente.

## Transaction privée de confirmation de paiement — 12 octobre 2026

La migration `supabase/migrations/20261012_billing_record_server_verified_checkout.sql` a été appliquée à Supabase. Elle ajoute un booléen test/live aux commandes et événements, puis la fonction privée `academy_billing.record_checkout_payment(...)`.

Elle requiert un appel depuis un **serveur autorisé** ayant préalablement vérifié le webhook Stripe réel, son HMAC sur la charge brute, sa fraîcheur et le paiement encaissé. Cette fonction SQL **ne vérifie pas elle-même Stripe** et ne doit pas être appelée à partir des données d'un navigateur.

Avant d'enregistrer le paiement, elle verrouille la commande canonique et compare : acheteur, formation, marchand, montant, devise, mode test/live, Checkout Session, PaymentIntent et consentement contractuel horodaté. L'ID d'événement est enregistré avec unicité ; une répétition reçoit une décision idempotente. Une transaction valide marque seulement la commande `paid` : elle **n'inscrit aucun apprenant**, ne crée aucune facture et n'envoie aucun e-mail.

Permissions vérifiées dans le projet actif : `service_role` seul peut exécuter la fonction (SECURITY INVOKER) ; `authenticated` et `anon` ne le peuvent pas. Un essai SQL sous `authenticated` a échoué avec `permission denied for schema academy_billing`. État après migration : 0 commande, 0 événement, 0 inscription et 0 compte Auth.

Les étapes critiques suivantes restent absentes : endpoint webhook serveur, fournisseur marchand IAgile identifié, création de commande côté serveur avec données légales validées, facturation, transaction test end-to-end, attribution d'accès après paiement vérifié, synchronisation des remboursements et gestion d'incidents. **Commercialisation : toujours NON AUTORISÉE.**
