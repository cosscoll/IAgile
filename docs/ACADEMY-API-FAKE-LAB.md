# IAgile — Laboratoire local d'API et de pannes (démonstration)
**Statut : simulation exécutable, non évaluée par des apprenants.**
Le script `scripts/academy-api-failure-lab.mjs` lance sur **127.0.0.1** un serveur HTTP fictif, conservant des tickets en mémoire vive uniquement. Aucun service client, webhook, e-mail, CRM, fichier premium, clé API ou base extérieure n'est appelé. Les données disparaissent quand le processus s'arrête.

## Démarrer
Prérequís : Node.js 20 ou supérieur, aucun package à installer.
```bash
node scripts/academy-api-failure-lab.mjs 12700
```
Dans un deuxième terminal :
```bash
curl http://127.0.0.1:12700/health
curl -X POST "http://127.0.0.1:12700/tickets?mode=normal" -H "Content-Type: application/json" -d '{"id":"T-1","description":"Ticket fictif"}'
curl http://127.0.0.1:12700/state?id=T-1
```

## Sept scénarios à rejouer
| Mode | HTTP observé | Ce qu'il faut vérifier |
| --- | --- | --- |
| `normal` | 201, ou 200 si doublon | ID unique et état exact dans `/state` |
| `silent-success` | 200 | **Aucun effet** n'est écrit malgré le succès HTTP |
| `timeout-after-write` | 504 | L'effet existe déjà : regarder `/state` AVANT le retry |
| `rate-limit` | 429 + Retry-After | Respecter le délai et contrôler l'état avant l'essai suivant |
| `unauthorized` | 401 | Refuser l'action sans bon contexte d'autorisation |
| `server-error` | 500 | L'échec est connu, ne pas présumer de l'état d'un service réel |
| `nonsense` | 400 | Paramètre `mode` inconnu : ne pas masquer l'erreur |

L'exemple de JSON attendu est `{"id":"T-2","description":"Ticket fictif"}`. Un JSON invalide renvoie 400 ; schéma incomplet 422 ; type Content-Type absent/inadapté 415 ; corps trop grand 413. Le simulateur refuse l'en-tête `Origin` pour éviter qu'un site extérieur lance des essais HTTP dans le navigateur.

## Mission autonome : faux succès et ambiguïté
1. Envoyez `T-2` en mode `silent-success` : vous recevez 200.
2. Lisez `GET /state?id=T-2`. Le résultat doit rester `written:false`. Notez pourquoi la réponse du moteur ne suffit pas.
3. Envoyez `T-3` en mode `timeout-after-write` : vous recevez 504.
4. Lisez `GET /state?id=T-3`. Le résultat doit être `written:true`.
5. Rejouez `T-3` en mode normal : le serveur doit signaler `duplicate:true`, jamais créer une deuxième écriture.
6. Expliquez la règle de reprise : un timeout peut être survenu **après** l'effet. Le vérifier évite les doubles actions.

**Livrable apprenant** : `docs/recette.md`, avec les requêtes, statuts réellement observés, état métier simulé, décision de reprise et cas de refus. N'écrivez jamais PASS si le test n'a pas été exécuté.

## Sécurité et limites
- Serveur volontairement lié à l'interface locale `127.0.0.1`, non adapté à un hébergement ni à une API de production.
- Les clés d'idempotence sont simplement les IDs de tickets factices en mémoire. Une véritable intégration multi-worker requiert une contrainte transactionnelle côté base.
- Le serveur n'est pas un clone complet de n8n ou d'un service de paiement.
- Le corps de requête doit être fictif. Aucune donnée privée, secret ni contenu client.
- Les API tierces, versions et coûts n'entrent pas dans le laboratoire ; ne pas prétendre les avoir testés.

## Vérification reproductible
```bash
node tests/academy-api-failure-lab.test.mjs
```
Les assertions inspectent les réponses HTTP **et** l'état simulé, y compris un 200 trompeur et un 504 après effet.
Lié à l'issue GitHub #59. Le laboratoire exécutable est un support complémentaire, pas un nouveau module ni une leçon premium dévoilée.
