# IAgile — Protocole de mesure du pilote (pré-lancement)

**Statut : outil technique prêt à tester ; aucun résultat d'apprenant recueilli, aucun effet pédagogique démontré.** Lié à l'issue #60.

## Question à résoudre
La réussite d'une démonstration ne démontre pas la maîtrise de la compétence. Le pilote doit distinguer :
- **guided** : exercice accompagné ;
- **transfer** : situation différente sans recopier les réponses guidées ;
- **delayed** : nouveau cas soumis plusieurs jours après, dans des conditions documentées.

Le protocole est défini avant de recueillir des chiffres. Une comparaison commerciale ne devient possible qu'avec des tâches et groupes raisonnablement comparables.

## Entrées privées autorisées
Le programme lit uniquement un tableau JSON depuis un chemin local explicitement fourni, jamais depuis Supabase ni Internet.

```json
[
  {
    "test_id": "T01",
    "course": "processus",
    "case_id": "CASE-EXAMPLE",
    "condition": "guided",
    "evidence": "not-tested",
    "passed": false,
    "minutes": 15,
    "help_requests": 0
  }
]
```

Les seuls champs autorisés sont `test_id` (pseudonyme non réversible, T01), `course` (processus, automatisation, agents, sites-3d), `case_id` fictif, `condition`, `evidence`, `passed`, `minutes` et `help_requests`. Tout champ supplémentaire, y compris e-mail, nom ou identifiant réel, est refusé. Pas de copier-coller de réponses ni de journaux privés.

**Important** : les valeurs de l'exemple sont fictives. Ne pas utiliser ces exemples comme résultats de pilote.

## Mesure et interprétation
```bash
node tests/academy-pilot-metrics.test.mjs
node scripts/academy-pilot-metrics.mjs /chemin/PRIVE/mesures-pseudonymisees.json
```
Sorties : nombre de participants distincts, volume par condition, nombre de preuves vérifiées, réussites vérifiées, résultats non vérifiés, médiane des durées des seuls essais vérifiés et répartition par formation. Aucun score de réussite n'est attribué à une épreuve marquée « unverified » ou « not-tested ».

**Garde-fous** :
- Pas de publication de mesures individuelles.
- Ne pas confondre « 5 participants » avec un échantillon représentatif : le script n'affiche que « descriptive-only ».
- Les épreuves guided et transfer doivent porter sur des compétences comparables, mais des scénarios distincts ; documenter durée, accès aux outils et aide réellement utilisée.
- Le `passed` doit provenir d'une correction d'après critères prédéfinis ; en absence de preuve, `evidence=not-tested` et `passed=false`.
- Obtenir consentement et organiser la conservation/suppression des fichiers selon les obligations applicables avant tout test réel.
- Une version future ne pourra conclure à une amélioration causale sans protocole contrôlé adapté.
- Ce script ne gère ni inscriptions, ni permissions Academy, ni ventes.

## Critère d'achèvement de l'outil
Tests automatiques au vert, rejet des entrées non conformes, cas vides et non vérifiés signalés, statut de preuve visible. **Critère d'achèvement du pilote réel distinct** : utilisateurs autorisés, exercices approuvés, matériel contrôlé, résultats effectivement observés et décision éditoriale.
