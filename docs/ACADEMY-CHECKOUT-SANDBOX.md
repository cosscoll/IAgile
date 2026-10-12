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
