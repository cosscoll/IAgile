import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
// Public empty workspace generator: no premium lesson, example dataset, API key or learner detail.
export const WORKSPACES=Object.freeze({
 processus:{name:'Processus du quotidien',goal:'Créer un processus expliqué, vérifiable et transmissible.'},
 automatisation:{name:'Automatisation',goal:'Simuler et tester un flux avant de connecter un service réel.'},
 agents:{name:'Agents IA',goal:'Définir les limites et les contrôles avant une action externe.'},
 'sites-3d':{name:'Sites web 3D',goal:'Construire un site lisible, accessible et testable sur plusieurs appareils.'}
});
const common={
 '.gitignore':`# Never commit secrets, client data or premium course material
.env
.env.*
!.env.example
node_modules/
dist/
build/
*.log
*.pem
*.key
private/
datasets/
paid-lessons/
*.zip
`,
 'BRIEF.md':`# Objectif du projet

## Besoin utilisateur
À préciser.

## Public concerné
À préciser.

## Résultat attendu
Décrire un résultat observable sans promesse non vérifiée.

## Périmètre
### Inclus
À définir.
### Exclu
À définir.

## Pré-requis et coût des outils
Lister les comptes, versions, permissions et éventuels abonnements.
`,
 'DECISIONS.md':`# Journal des décisions

| Date | Décision | Raison et preuve | Alternative écartée | À réexaminer |
| --- | --- | --- | --- | --- |
| À remplir | Exemple : environnement local | À vérifier | Service externe | Oui |

Ne pas écrire « testé » si la validation n'a pas eu lieu.
`,
 'SOURCES.md':`# Références et provenance

| Assertion | Source primaire | Date | Statut |
| --- | --- | --- | --- |
| À confirmer | URL ou document autorisé | À renseigner | Non vérifié |

Ne pas coller ici de documents confidentiels, copies d'apprenants ou clés API.
`,
 'NEXT.md':`# Reprise de travail

## Dernière action effectuée
Non renseignée.

## Ce qui fonctionne (avec preuve)
Rien de confirmé.

## Blocages connus
À documenter.

## Prochaine action courte et testable
Définir un premier exemple fictif.

## Comment reprendre sur un autre ordinateur
Voir README et vérifier les versions des outils.
`,
 'docs/TESTS.md':`# Recette et preuves

| Vérification | Étapes reproductibles | Attendu | Observé | Statut |
| --- | --- | --- | --- | --- |
| Premier usage | À écrire | À écrire | Non testé | NON TESTÉ |
| Cas d'erreur | À écrire | Refus attendu | Non testé | NON TESTÉ |
| Sécurité | Ne pas exposer les secrets | Aucun secret | Non testé | NON TESTÉ |
| Reprise par un tiers | Suivre README | Reproductible | Non testé | NON TESTÉ |

Les statuts possibles sont PASS / FAIL / NON TESTÉ.
Conserver les preuves dans un emplacement autorisé, sans données personnelles.
`,
 'GITHUB.md':`# Créer et organiser votre dépôt GitHub

1. Installer Git et créer un compte GitHub. Ne transmettez jamais le mot de passe ou un token à une IA.
2. Ouvrir ce dossier local dans un terminal. Lire BRIEF.md et docs/TESTS.md.
3. Vérifier les fichiers, surtout .gitignore ; les dossiers privés ou les corrigés d'IAgile n'y ont pas leur place.
4. Initialiser l'historique :

\`\`\`bash
git init
git add README.md BRIEF.md DECISIONS.md SOURCES.md NEXT.md GITHUB.md docs/TESTS.md .gitignore
git commit -m "Initialiser mon projet"
\`\`\`

5. Sur github.com, créer un dépôt **privé** vide, sans README généré (ce dossier en possède déjà un). Puis copier les commandes « push an existing repository » données par GitHub, selon le nom exact de votre dépôt. Ne jamais inventer l'URL du dépôt.
6. Alternative avec GitHub CLI installé et authentifié :

\`\`\`bash
gh repo create --private --source=. --remote=origin --push
\`\`\`

7. Avant chaque partage, relire la liste des fichiers. Vérifier le dépôt distant après la première publication. Aucun dépôt distant n'est créé automatiquement par ce kit.

## Organisation des modifications

Utiliser une branche pour une évolution significative, écrire ce qui change dans DECISIONS.md, ouvrir une pull request avec les étapes de test, vérifier la version publiée et conserver un moyen de revenir en arrière.
`
};
export async function createAcademyWorkspace(course,destination){
 if(!Object.hasOwn(WORKSPACES,course))throw Error('Unknown course; use processus, automatisation, agents or sites-3d');
 if(typeof destination!=='string'||!destination.trim())throw Error('Specify a new destination folder');
 const target=path.resolve(destination);
 await mkdir(target,{recursive:false}); // Fail closed: never overwrite an existing project.
 const readme=`# Mon projet IAgile — ${WORKSPACES[course].name}

${WORKSPACES[course].goal}

**Dossier personnel de démarrage, sans supports premium ni données réelles.**

## Démarrage
1. Compléter BRIEF.md et les prérequis.
2. Noter chaque décision dans DECISIONS.md.
3. Identifier les références consultées dans SOURCES.md.
4. Construire un exemple fictif et documenter les essais dans docs/TESTS.md.
5. Conserver NEXT.md à jour pour reprendre après interruption.
6. Lire GITHUB.md pour créer **vous-même** un dépôt distant privé.

## Contexte du cours
Parcours : ${course}. Tous les fichiers sont de simples modèles vides ; ils ne prouvent pas l'accès à la formation ou sa réussite.
`;
 for(const [file,text] of Object.entries({ ...common,'README.md':readme })){
   const filename=path.join(target,file);
   await mkdir(path.dirname(filename),{recursive:true});
   await writeFile(filename,text,{flag:'wx',encoding:'utf8'});
 }
 return {directory:target,course,files:Object.keys(common).length+1,remoteCreated:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [course,destination]=process.argv.slice(2);
 try{
   const result=await createAcademyWorkspace(course,destination);
   process.stdout.write('Created '+result.files+' local starter files for '+result.course+
    '. No remote GitHub repository was created.\n');
 }catch(error){process.stderr.write('Workspace creation refused: '+error.message+'\n');process.exitCode=1;}
}
