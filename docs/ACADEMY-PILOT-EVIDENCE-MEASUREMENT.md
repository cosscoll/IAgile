# IAgile — Protocole de preuve du pilote (sans chiffres inventés)

**Statut : outil de collecte/analyse préparé, zéro test humain confirmé.** Cette procédure ne publie pas de résultats d'apprentissage et n'active ni cours, ni paiement.

## Objectif

Distinguer trois états : (1) exercice guidé réalisé **avec** aide, (2) situation différente exécutée de façon autonome, (3) vérification différée sur un nouveau cas. Une réussite d'exercice guidé ne prouve pas à elle seule une compétence durable. Les thèmes des quatre formations sont `processus`, `automatisation`, `agents`, `sites-3d`.

## Procédure avant de démarrer un pilote

1. Obtenir un accord de participation documenté, choisir les objectifs pédagogiques et pré-définir la correction des tâches. Le script ne vérifie pas la conformité RGPD à lui seul.
2. Demander à une personne habilitée de générer des pseudonymes aléatoires distincts : `T01`, `T02`, etc. **Ne jamais ajouter les noms, emails, UUID utilisateur ou clés de correspondance dans GitHub.** Conserver le registre de correspondance séparément avec un accès restreint et une durée de conservation définie.
3. Concevoir des tâches de difficulté comparable, dont un cas vraiment inédit, et un barème avant de voir les réponses. Mesurer : réussite vérifiée, durée réelle, nombre de demandes d'aide. Ne pas enregistrer les réponses complètes dans le fichier de mesures.
4. Lors de chaque essai, renseigner les observations et leur preuve **réelle**. `verified` implique une trace contrôlée par un évaluateur, `unverified` et `not-tested` ne peuvent JAMAIS porter `passed:true`.
5. Refaire un exercice distinct ultérieurement si les participants ont donné leur accord. `delayed` décrit le type d'épreuve et ne garantit pas un vrai délai sans fiche de suivi.
6. Comparer descriptivement les taux vérifiés et les aides nécessaires, sans affirmer une amélioration due à la formation. Pour une comparaison face à une offre concurrente, contrôler les différences entre groupes, les prérequis et l'équivalence des tâches.

## Schéma de données d'observation

Fichier JSON **privé**, hors du dépôt GitHub et des fichiers de la vitrine :

```json
[
  {
    "test_id": "T01",
    "course": "processus",
    "case_id": "CASE-DEMO-A",
    "condition": "guided",
    "evidence": "verified",
    "passed": true,
    "minutes": 18,
    "help_requests": 2
  },
  {
    "test_id": "T01",
    "course": "processus",
    "case_id": "CASE-DEMO-B",
    "condition": "transfer",
    "evidence": "not-tested",
    "passed": false,
    "minutes": 1,
    "help_requests": 0
  }
]
```

**Toutes les valeurs de cet exemple sont fictives** : elles ne reflètent aucun élève, essai ni résultat IAgile. Les essais non réalisés peuvent simplement être omis plutôt que d'enregistrer un temps fictif. Le champ `minutes` représente une durée réellement mesurée ; pour une épreuve non réalisée, préférer **ne pas créer d'observation**.

## Utilisation

```bash
node tests/academy-pilot-metrics.test.mjs
node scripts/academy-pilot-metrics.mjs /chemin-prive/observations-pseudonymisees.json
```

L'outil échoue sur un champ supplémentaire (y compris un identifiant personnel), un cas dupliqué, un statut inconnu, un temps impossible ou une réussite non vérifiée. Les sorties regroupent les nombres par condition et formation et indiquent les limites. **Aucune donnée d'élève n'est incluse dans les messages de sortie.**

## Lecture correcte

- `no-data` : aucune observation ; ne pas afficher de KPI de performance d'élève.
- `small-sample` : moins de cinq personnes ; pas de généralisation.
- `descriptive-only` : même avec cinq personnes ou plus, le protocole ne démontre ni causalité, ni efficacité sur le marché.
- `verified` et `passed` sont **des comptes**, pas un classement commercial.
- `medianMinutesVerified` concerne seulement les cas réellement vérifiés, toutes conditions confondues ; comparer les conditions séparément avant d'interpréter.

## Critères de validation avant de communiquer

- [ ] Une personne a vérifié les preuves avec un barème pré-établi.
- [ ] Aucune copie entière, email, secret ni table de correspondance dans le dépôt.
- [ ] Les cas de transfert ne reprennent pas les mêmes réponses que les cas guidés.
- [ ] Les absences, échecs et cas non testés ne sont pas maquillés en réussites.
- [ ] Les limites d'effectif et de sélection sont annoncées.
- [ ] Les durées et aides déclarées correspondent à un protocole exécuté.
- [ ] Les résultats d'une formation concurrente sont comparables ou la différence est explicitement reconnue.

Suivi : [GitHub #60](https://github.com/cosscoll/IAgile/issues/60). Aucun changement des RLS, paiements ou accès premium dans ce chantier.
