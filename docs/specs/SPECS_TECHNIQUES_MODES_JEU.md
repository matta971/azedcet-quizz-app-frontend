# MINDSOCCER - SPECIFICATIONS TECHNIQUES DES MODES DE JEU

## Table des matieres

1. [Schema des Questions](#1-schema-des-questions)
2. [Reflexe & Pression](#2-reflexe--pression)
3. [Strategie & Themes](#3-strategie--themes)
4. [Enigmes & Indices](#4-enigmes--indices)
5. [Parcours & Exploration](#5-parcours--exploration)
6. [Evenements WebSocket](#6-evenements-websocket)

---

# 1. SCHEMA DES QUESTIONS

## 1.1 Structure de base d'une question

```typescript
interface Question {
  id: string;
  text: string;                    // Texte de la question
  answer: string;                  // Reponse attendue
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  themes: string[];                // Ex: ['musique', 'cinema', 'sport']
  categories: string[];            // Ex: ['culture_generale', 'geographie']
  language: string;                // Code langue (FR, EN, etc.)
  type: QuestionType;
  metadata?: QuestionMetadata;
}

type QuestionType =
  | 'STANDARD'           // Question simple avec reponse textuelle
  | 'QCM'                // Question a choix multiples
  | 'INDICES'            // Question avec indices progressifs
  | 'ALPHABETIQUE'       // Question avec reponse commencant par une lettre specifique
  | 'ECLAIR';            // Question rapide (Sprint Final)
```

## 1.2 Question avec indices (Jackpot, Identification)

```typescript
interface QuestionIndices extends Question {
  type: 'INDICES';
  indices: Indice[];
}

interface Indice {
  order: number;         // 1, 2, 3, 4
  text: string;          // Texte de l'indice
  pointsValue: number;   // Points si reponse correcte a cet indice
}

// Exemple:
{
  id: "q_mite_001",
  text: "Qui suis-je ?",
  answer: "LA MITE",
  difficulty: "MEDIUM",
  themes: ["animaux", "insectes", "vie_quotidienne"],
  categories: ["culture_generale"],
  language: "FR",
  type: "INDICES",
  indices: [
    {
      order: 1,
      text: "Insecte de la famille des tineides et du sous-ordre des heteroceres, je mesure de 7 a 15 millimetres et peux pondre jusqu'a 300 oeufs ;",
      pointsValue: 40
    },
    {
      order: 2,
      text: "j'existe sous d'autres varietes comme la pyrale de la farine ou mon espece dite des fourrures ; nuisible a l'activite humaine,",
      pointsValue: 30
    },
    {
      order: 3,
      text: "je m'attaque aux tissus et aux vetements ;",
      pointsValue: 20
    },
    {
      order: 4,
      text: "on peut me combattre avec de la naphtaline, de la lavande, des huiles essentielles, ou de l'antimite.",
      pointsValue: 10
    }
  ]
}
```

## 1.3 Question alphabetique (Randonnee Lexicale)

```typescript
interface QuestionAlphabetique extends Question {
  type: 'ALPHABETIQUE';
  targetLetter: string;  // A, B, C, ..., Z
}

// Exemple:
{
  id: "q_alpha_a_001",
  text: "Capital de l'Italie ?",
  answer: "ROME",
  targetLetter: "R",
  // ...
}
```

## 1.4 Themes disponibles

```typescript
const THEMES = [
  'musique',
  'cinema',
  'sport',
  'histoire',
  'geographie',
  'sciences',
  'litterature',
  'art',
  'gastronomie',
  'nature',
  'animaux',
  'technologie',
  'politique',
  'economie',
  'religion',
  'mythologie',
  'langues',
  'mathematiques',
  'astronomie',
  'medecine'
] as const;
```

## 1.5 Questions par pays (Saut Patriotique)

```typescript
interface QuestionPays extends Question {
  country: string;  // Code ISO pays (BEN, FRA, SEN, etc.)
}
```

---

# 2. REFLEXE & PRESSION

## 2.1 SMASH A & SMASH B

> **Deja implemente** - Voir specs fonctionnelles existantes

---

## 2.2 DUEL LINGUISTIQUE

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | 1v1 (TYPE B) |
| Source questions | Systeme |
| Nombre de rounds | 3 a 10 (configurable) |
| Points victoire | +10 |
| Points defaite | -5 |
| Bonus rapidite | +1 a +3 |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DUEL LINGUISTIQUE - WORKFLOW                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : CONFIGURATION                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Nombre de rounds choisi (3, 5, 7 ou 10)                                  │
│  • Les 2 joueurs sont prets                                                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : AFFICHAGE QUESTION (par round)                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le systeme affiche la question aux 2 joueurs simultanement               │
│  • Un chrono de 10 secondes demarre                                         │
│  • Les 2 joueurs peuvent buzzer                                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : BUZZ & REPONSE                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le premier a buzzer a 5 secondes pour repondre                           │
│  • L'autre joueur est bloque pendant ce temps                               │
│                                                                             │
│  CAS 1 : Reponse CORRECTE                                                   │
│    → Buzzeur gagne 10 pts + bonus rapidite (1-3 pts selon temps)            │
│    → Round termine                                                          │
│                                                                             │
│  CAS 2 : Reponse INCORRECTE                                                 │
│    → Buzzeur perd 5 pts                                                     │
│    → L'autre joueur peut repondre (5 sec)                                   │
│      • Si correct : +10 pts (pas de bonus)                                  │
│      • Si incorrect ou timeout : 0 pts                                      │
│                                                                             │
│  CAS 3 : Aucun buzz (timeout 10s)                                           │
│    → 0 pts pour les deux                                                    │
│    → Round termine                                                          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3 : FIN DE PARTIE                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Apres N rounds, le joueur avec le plus de points gagne                   │
│  • En cas d'egalite : round supplementaire (mort subite)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Calcul du bonus rapidite

```typescript
function calculateSpeedBonus(responseTimeMs: number, maxTimeMs: number): number {
  const ratio = responseTimeMs / maxTimeMs;
  if (ratio <= 0.25) return 3;  // Tres rapide (< 25% du temps)
  if (ratio <= 0.50) return 2;  // Rapide (25-50% du temps)
  if (ratio <= 0.75) return 1;  // Moyen (50-75% du temps)
  return 0;                      // Lent (> 75% du temps)
}
```

### Evenements WebSocket

| Evenement | Direction | Payload |
|-----------|-----------|---------|
| `DUEL_START` | Server → Clients | `{rounds, player1, player2}` |
| `DUEL_QUESTION` | Server → Clients | `{roundNumber, question, timeoutMs}` |
| `DUEL_BUZZ` | Client → Server | `{playerId}` |
| `DUEL_BUZZ_CONFIRMED` | Server → Clients | `{buzzerId, timeMs, otherCanAnswer}` |
| `DUEL_ANSWER` | Client → Server | `{answer}` |
| `DUEL_RESULT` | Server → Clients | `{correct, points, speedBonus, scores}` |
| `DUEL_ROUND_END` | Server → Clients | `{roundNumber, scores}` |
| `DUEL_MATCH_END` | Server → Clients | `{winner, finalScores}` |

---

## 2.3 MARATHON SOLO

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Solo (TYPE C) |
| Source questions | Systeme |
| Nombre de questions | 10 |
| Chrono | Aucun |
| Points par question | +10 |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MARATHON SOLO - WORKFLOW                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : DEBUT                                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le joueur demarre la partie                                              │
│  • 10 questions sont selectionnees (difficulte mixte)                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : QUESTIONS (x10)                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Question affichee                                                        │
│  • Pas de chrono - le joueur reflechit autant qu'il veut                    │
│  • Le joueur saisit sa reponse                                              │
│  • Validation immediate : CORRECT (+10 pts) ou INCORRECT (0 pts)            │
│  • Passage a la question suivante                                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3 : RESULTATS                                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Score final affiche (max 100 pts)                                        │
│  • Statistiques : temps total, taux de reussite                             │
│  • Mise a jour score global/saison                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Structure de donnees

```typescript
interface MarathonGame {
  id: string;
  playerId: string;
  questions: Question[];     // 10 questions
  currentIndex: number;
  answers: MarathonAnswer[];
  score: number;
  startedAt: Date;
  finishedAt?: Date;
}

interface MarathonAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
  timeSpentMs: number;
}
```

---

## 2.4 SPRINT FINAL

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Equipe vs Equipe (TYPE A) |
| Source questions | Systeme |
| Nombre de questions | 20 |
| Temps par question | 5 secondes |
| Points bonne reponse | +2 |
| Points mauvaise reponse | -1 |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SPRINT FINAL - WORKFLOW                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : PREPARATION                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • 2 equipes en lobby                                                       │
│  • 20 questions eclair selectionnees                                        │
│  • Questions alternees entre les equipes                                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : QUESTIONS ALTERNEES (x20)                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Pour chaque question :                                                     │
│                                                                             │
│  • Question affichee a l'equipe active                                      │
│  • Chrono 5 secondes demarre                                                │
│  • N'importe quel membre peut buzzer et repondre                            │
│                                                                             │
│  SI reponse donnee avant 5s :                                               │
│    • CORRECT → +2 pts                                                       │
│    • INCORRECT → -1 pt                                                      │
│                                                                             │
│  SI timeout (pas de reponse) :                                              │
│    • 0 pts                                                                  │
│                                                                             │
│  → Passage a l'equipe suivante                                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : FIN DE PARTIE                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Score final des 2 equipes                                                │
│  • L'equipe avec le plus de points gagne                                    │
│  • Score max theorique : 40 pts (20 questions x 2 pts)                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Evenements WebSocket

| Evenement | Direction | Payload |
|-----------|-----------|---------|
| `SPRINT_START` | Server → Clients | `{teamA, teamB, totalQuestions}` |
| `SPRINT_QUESTION` | Server → Clients | `{number, question, activeTeam, timeoutMs: 5000}` |
| `SPRINT_BUZZ` | Client → Server | `{playerId}` |
| `SPRINT_ANSWER` | Client → Server | `{answer}` |
| `SPRINT_RESULT` | Server → Clients | `{correct, points, scores}` |
| `SPRINT_TIMEOUT` | Server → Clients | `{activeTeam, scores}` |
| `SPRINT_END` | Server → Clients | `{winner, finalScores, stats}` |

---

# 3. STRATEGIE & THEMES

## 3.1 PANIER

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Equipe vs Equipe (TYPE A) |
| Source questions | Systeme (par theme) |
| Nombre de questions | 4 par serie |
| Selection theme | Equipe en tete |
| Tireur | 1 seul joueur par equipe |
| Aide | Interdite |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PANIER - WORKFLOW                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : SELECTION DU TIREUR                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Chaque equipe designe son tireur                                         │
│  • Le tireur ne peut pas etre aide                                          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : CHOIX DU THEME (equipe en tete ou tirage au sort)                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Liste des themes disponibles affichee                                    │
│  • L'equipe en tete clique sur un theme                                     │
│  • 4 questions du theme sont selectionnees                                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : QUESTIONS (x4)                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Pour chaque question :                                                     │
│                                                                             │
│  • Question affichee au tireur de l'equipe active                           │
│  • Chrono de 15 secondes                                                    │
│  • Le tireur repond seul (pas d'aide)                                       │
│                                                                             │
│  Resultat :                                                                 │
│    • CORRECT → +10 pts                                                      │
│    • INCORRECT → 0 pts                                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3 : BONUS 4/4                                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Si le tireur repond correctement aux 4 questions → +10 pts bonus         │
│  • Score max par serie : 50 pts (4x10 + 10 bonus)                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 4 : ALTERNANCE                                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Les roles s'inversent                                                    │
│  • L'autre equipe choisit un theme et joue                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Selection des themes

```typescript
interface ThemeSelection {
  availableThemes: string[];      // Themes ayant des questions disponibles
  selectedTheme: string | null;
  selectingTeam: 'A' | 'B';
}

// Endpoint: GET /api/questions/themes?language=FR
// Response: { themes: ['musique', 'cinema', 'sport', ...] }
```

---

## 3.2 RELAIS

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | 2v2 (TYPE A) |
| Source questions | Systeme (par theme) |
| Selection theme | Equipe menee |
| Ordre des joueurs | Aleatoire, alternance equipes |
| Temps total max | 40 secondes pour bonus |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RELAIS - WORKFLOW                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : CONFIGURATION                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • 2 equipes de 2 joueurs chacune                                           │
│  • L'equipe menee choisit le theme                                          │
│  • 4 questions du theme selectionnees                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : ORDRE ALEATOIRE                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le systeme genere un ordre aleatoire de 4 joueurs                        │
│  • CONTRAINTE : Jamais 2 joueurs de la meme equipe a la suite               │
│                                                                             │
│  Exemple d'ordre valide :                                                   │
│    [A1] → [B1] → [A2] → [B2]                                                │
│    [B2] → [A1] → [B1] → [A2]                                                │
│                                                                             │
│  Exemple d'ordre INVALIDE :                                                 │
│    [A1] → [A2] → [B1] → [B2]  ← NON (A1 et A2 se suivent)                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : QUESTIONS EN CHAINE                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Chrono global demarre                                                    │
│  • Question 1 → Joueur 1 (ex: A1)                                           │
│  • Question 2 → Joueur 2 (ex: B1)                                           │
│  • Question 3 → Joueur 3 (ex: A2)                                           │
│  • Question 4 → Joueur 4 (ex: B2)                                           │
│                                                                             │
│  Chaque joueur a 15s pour repondre                                          │
│  Si incorrect ou timeout → chaine brisee                                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3 : CALCUL DES POINTS                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • +10 pts par bonne reponse pour l'equipe du joueur                        │
│  • BONUS +20 pts si :                                                       │
│    - Toutes les reponses sont correctes (4/4)                               │
│    - ET temps total <= 40 secondes                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Algorithme d'ordre aleatoire

```typescript
function generateRelayOrder(teamA: Player[], teamB: Player[]): Player[] {
  const order: Player[] = [];
  const poolA = [...teamA];
  const poolB = [...teamB];

  // Melanger chaque pool
  shuffle(poolA);
  shuffle(poolB);

  // Alterner entre les pools
  let lastTeam: 'A' | 'B' | null = null;

  while (poolA.length > 0 || poolB.length > 0) {
    if (lastTeam !== 'A' && poolA.length > 0) {
      order.push(poolA.shift()!);
      lastTeam = 'A';
    } else if (lastTeam !== 'B' && poolB.length > 0) {
      order.push(poolB.shift()!);
      lastTeam = 'B';
    } else if (poolA.length > 0) {
      order.push(poolA.shift()!);
      lastTeam = 'A';
    } else {
      order.push(poolB.shift()!);
      lastTeam = 'B';
    }
  }

  return order;
}
```

---

## 3.3 SAUT PATRIOTIQUE

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Equipe vs Equipe (TYPE A) |
| Source questions | Systeme (par pays) |
| Selection pays | Automatique (voir regles) |
| Mecanisme special | "En voulez-vous ?" |

### Determination du pays

```typescript
function determineCountry(teamPlayers: Player[]): string {
  // 1. Compter les pays renseignes
  const countryCounts: Record<string, number> = {};
  let playersWithCountry = 0;

  for (const player of teamPlayers) {
    if (player.country) {
      playersWithCountry++;
      countryCounts[player.country] = (countryCounts[player.country] || 0) + 1;
    }
  }

  // 2. Si au moins un joueur a renseigne son pays
  if (playersWithCountry > 0) {
    // Retourner le pays le plus represente
    return Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  // 3. Sinon, deduire du language prefere
  const languageCounts: Record<string, number> = {};
  for (const player of teamPlayers) {
    const lang = player.preferredLanguage || 'FR';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  }

  const dominantLanguage = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)[0][0];

  return LANGUAGE_TO_COUNTRY[dominantLanguage] || 'FRA';
}

const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  'FR': 'FRA',
  'EN': 'GBR',
  'FON': 'BEN',
  'CR': 'HTI',
  'PT': 'PRT',
  'ES': 'ESP',
  'AR': 'MAR',
  'ZH': 'CHN',
  'DE': 'DEU',
  'IT': 'ITA'
};
```

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SAUT PATRIOTIQUE - WORKFLOW                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : DETERMINATION DU PAYS                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • L'equipe en tete est selectionnee                                        │
│  • Son pays est determine automatiquement                                   │
│  • Questions sur ce pays sont chargees                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : ANNONCE DU THEME                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • "Les questions porteront sur [PAYS]"                                     │
│  • L'equipe adverse est interrogee : "En voulez-vous ?"                     │
│                                                                             │
│  SI "OUI" :                                                                 │
│    → L'equipe adverse repond aux questions                                  │
│                                                                             │
│  SI "NON" :                                                                 │
│    → L'equipe en tete repond aux questions                                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : QUESTIONS (5 questions)                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Pour chaque question :                                                     │
│                                                                             │
│  • Question affichee                                                        │
│  • L'equipe peut repondre ou passer                                         │
│                                                                             │
│  REGLE SPECIALE : Cascade                                                   │
│    • Bonne reponse → +10 pts                                                │
│    • Mauvaise reponse → ANNULE la derniere bonne reponse                    │
│                                                                             │
│  Exemple :                                                                  │
│    Q1: Correct (+10)  → Total: 10                                           │
│    Q2: Correct (+10)  → Total: 20                                           │
│    Q3: Incorrect      → Total: 10 (annule Q2)                               │
│    Q4: Correct (+10)  → Total: 20                                           │
│    Q5: Correct (+10)  → Total: 30                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3.4 CAPOEIRA

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Equipe vs Equipe (TYPE A) |
| Theme fixe | Musique |
| Selection questions | Equipe en tete |
| Nombre de questions | 4 |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CAPOEIRA - WORKFLOW                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : SELECTION DES QUESTIONS                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • L'equipe en tete voit 8-10 questions sur le theme MUSIQUE                │
│  • Elle en selectionne 4 pour l'equipe adverse                              │
│  • Elle doit connaitre les reponses (pour validation)                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : QUESTIONS A L'ADVERSAIRE (x4)                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Pour chaque question :                                                     │
│                                                                             │
│  • Question affichee a l'equipe adverse                                     │
│  • Chrono 15 secondes                                                       │
│                                                                             │
│  Resultat :                                                                 │
│    • CORRECT → +10 pts pour l'equipe qui repond                             │
│    • INCORRECT → +10 pts pour l'equipe qui a pose                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : ALTERNANCE                                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Les roles s'inversent                                                    │
│  • L'autre equipe selectionne 4 questions musique                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3.5 CIME

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Solo ou Equipe-Solo (TYPE C) |
| Source questions | Systeme (difficulte croissante) |
| Nombre de questions | 10 |
| Jokers | 3 (aide d'un coequipier) |
| Mecanisme | Quitter ou doubler |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CIME - WORKFLOW                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : PREPARATION                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • 1 joueur represente l'equipe (le grimpeur)                               │
│  • Les coequipiers sont en support (jokers)                                 │
│  • 10 questions de difficulte croissante                                    │
│  • 3 jokers disponibles                                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : ASCENSION (x10 questions)                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Pour chaque palier (question) :                                            │
│                                                                             │
│  • Question affichee (difficulte croissante)                                │
│  • Le grimpeur peut :                                                       │
│    [REPONDRE] - Tenter la reponse                                           │
│    [JOKER]    - Demander l'aide d'un coequipier (3 max)                     │
│    [QUITTER]  - Abandonner et garder les points acquis                      │
│                                                                             │
│  SI utilisation JOKER :                                                     │
│    → Le grimpeur designe un coequipier                                      │
│    → Le coequipier voit la question et propose une reponse                  │
│    → Le grimpeur decide de suivre ou non                                    │
│    → Joker consomme dans tous les cas                                       │
│                                                                             │
│  Points par palier (difficulte croissante) :                                │
│    Palier 1-3   : 10 pts/question (EASY)                                    │
│    Palier 4-6   : 20 pts/question (MEDIUM)                                  │
│    Palier 7-9   : 40 pts/question (HARD)                                    │
│    Palier 10    : 100 pts (SOMMET)                                          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : CALCUL FINAL                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  SI le grimpeur atteint le sommet (10/10) :                                 │
│    → Score max : 30 + 60 + 120 + 100 = 310 pts                              │
│                                                                             │
│  SI le grimpeur quitte volontairement :                                     │
│    → Garde tous les points accumules                                        │
│                                                                             │
│  SI le grimpeur echoue :                                                    │
│    → Perd TOUS les points (retour a 0)                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Structure des points

```typescript
const CIME_POINTS = [
  { level: 1, points: 10, difficulty: 'EASY' },
  { level: 2, points: 10, difficulty: 'EASY' },
  { level: 3, points: 10, difficulty: 'EASY' },
  { level: 4, points: 20, difficulty: 'MEDIUM' },
  { level: 5, points: 20, difficulty: 'MEDIUM' },
  { level: 6, points: 20, difficulty: 'MEDIUM' },
  { level: 7, points: 40, difficulty: 'HARD' },
  { level: 8, points: 40, difficulty: 'HARD' },
  { level: 9, points: 40, difficulty: 'HARD' },
  { level: 10, points: 100, difficulty: 'HARD' }, // SOMMET
];
```

---

# 4. ENIGMES & INDICES

## 4.1 JACKPOT

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | 1v1 ou Equipe (TYPE B) |
| Cagnotte initiale | 100 pts par equipe |
| Nombre de questions | 3 |
| Indices par question | 3 |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  JACKPOT - WORKFLOW                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : INITIALISATION                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Chaque equipe recoit une cagnotte de 100 points                          │
│  • 3 questions a indices sont selectionnees                                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POUR CHAQUE QUESTION (x3) :                                                │
│                                                                             │
│  PHASE 1 : ENCHERES                                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Les 2 equipes voient : "Nouvelle enigme - Misez vos points"              │
│  • Chaque equipe mise secretement (min 0, max = cagnotte restante)          │
│  • Les mises sont revelees simultanement                                    │
│  • L'equipe qui mise le PLUS doit repondre                                  │
│  • En cas d'egalite : Question eclair (premier qui buzze)                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : INDICES PROGRESSIFS                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Indice 1 affiche                                                         │
│  • L'equipe peut : [REPONDRE] ou [INDICE SUIVANT]                           │
│                                                                             │
│  SI [REPONDRE] :                                                            │
│    • CORRECT → Gagne les points mises par les 2 equipes                     │
│    • INCORRECT → Perd sa mise, l'autre equipe gagne sa propre mise          │
│      → Question devient "eclair" pour l'autre equipe                        │
│                                                                             │
│  SI [INDICE SUIVANT] (max 3 indices) :                                      │
│    • Indice suivant affiche                                                 │
│    • Continue jusqu'a reponse ou 3eme indice                                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3 : APRES 3 INDICES SANS REPONSE                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • La question devient une "QUESTION ECLAIR"                                │
│  • Les 2 equipes peuvent buzzer                                             │
│  • Premier a buzzer et repondre correctement gagne la mise totale           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FIN DE PARTIE                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Apres 3 questions                                                        │
│  • L'equipe avec le plus de points dans sa cagnotte gagne                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Exemple de partie

```
Initial: Equipe A = 100 pts, Equipe B = 100 pts

Question 1:
  - A mise 30, B mise 20 → A doit repondre
  - Indice 1: A passe
  - Indice 2: A passe
  - Indice 3: A repond CORRECT
  → A gagne 30+20 = 50 pts
  → A = 150 pts (100-30+50), B = 80 pts (100-20)

Question 2:
  - A mise 50, B mise 50 → Egalite, question eclair
  - B buzze et repond CORRECT
  → B gagne 50+50 = 100 pts
  → A = 100 pts, B = 130 pts

Question 3:
  - A mise 40, B mise 60 → B doit repondre
  - Indice 1: B repond INCORRECT
  → B perd 60 pts, A recupere ses 40 pts
  → Question eclair pour A
  - A repond CORRECT → A gagne 60 pts de B
  → A = 200 pts, B = 70 pts

Resultat: A gagne (200 vs 70)
```

---

## 4.2 IDENTIFICATION

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | 1v1 (TYPE B) |
| Indices | 4 (predefinis) |
| Points | 40 → 30 → 20 → 10 |
| Tentatives | 1 par indice |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  IDENTIFICATION - WORKFLOW                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : TOUR D'UN JOUEUR                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  • Indice 1 affiche (valeur: 40 pts)                                        │
│  • Le joueur peut : [REPONDRE] ou [PASSER]                                  │
│                                                                             │
│  SI [REPONDRE] :                                                            │
│    • CORRECT → Gagne les points de l'indice actuel, fin du tour             │
│    • INCORRECT → Perd sa tentative, indice suivant                          │
│                                                                             │
│  SI [PASSER] :                                                              │
│    • Indice suivant affiche (valeur reduite)                                │
│                                                                             │
│  Progression :                                                              │
│    Indice 1 : 40 pts                                                        │
│    Indice 2 : 30 pts                                                        │
│    Indice 3 : 20 pts                                                        │
│    Indice 4 : 10 pts                                                        │
│                                                                             │
│  Apres indice 4 sans bonne reponse : 0 pts pour ce tour                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : ALTERNANCE                                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Les roles s'inversent avec une nouvelle enigme                           │
│  • Plusieurs rounds (configurable)                                          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FIN DE PARTIE                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le joueur avec le plus de points gagne                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.3 ESTOCADE

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Equipe vs Equipe (TYPE A) |
| Questions | 3 (tres difficiles) |
| Indices max | 3 par question |
| Points par question | 40 |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ESTOCADE - WORKFLOW                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Pour chaque question (x3) :                                                │
│                                                                             │
│  PHASE 1 : QUESTION POSEE                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Question tres difficile affichee a l'equipe active                       │
│  • L'equipe peut : [REPONDRE] ou [INDICE]                                   │
│                                                                             │
│  SI [INDICE] (max 3) :                                                      │
│    • Un indice supplementaire est revele                                    │
│    • Chaque indice reduit la valeur de la question :                        │
│      - 0 indice : 40 pts                                                    │
│      - 1 indice : 30 pts                                                    │
│      - 2 indices : 20 pts                                                   │
│      - 3 indices : 10 pts                                                   │
│                                                                             │
│  SI [REPONDRE] :                                                            │
│    • CORRECT → Gagne les points selon indices utilises                      │
│    • INCORRECT → 0 pts, question terminee                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Score maximum possible : 120 pts (3 x 40 sans indice)                      │
│  Score minimum si tout correct : 30 pts (3 x 10 avec tous indices)          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4.4 TIRS AU BUT

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | 1v1 (TYPE B) |
| Role | Tireur vs Gardien |
| Essais | 3 |
| Points | 40 si reussite |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TIRS AU BUT - WORKFLOW                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 0 : ATTRIBUTION DES ROLES                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Un joueur est TIREUR, l'autre est GARDIEN                                │
│  • Le gardien connait un MOT SECRET                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : LE GARDIEN DONNE DES INDICES                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le gardien ecrit un indice (texte libre)                                 │
│  • L'indice est envoye au tireur                                            │
│                                                                             │
│  Regles pour le gardien :                                                   │
│    - Ne peut PAS donner le mot directement                                  │
│    - Ne peut PAS donner de synonyme direct                                  │
│    - Peut donner des indices contextuels, associations, etc.                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : LE TIREUR DEVINE (3 essais max)                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Essai 1 :                                                                  │
│    • Tireur voit l'indice et propose un mot                                 │
│    • SI correct → Tireur gagne 40 pts, fin                                  │
│    • SI incorrect → Gardien donne un nouvel indice                          │
│                                                                             │
│  Essai 2 :                                                                  │
│    • Tireur propose un autre mot                                            │
│    • SI correct → Tireur gagne 40 pts, fin                                  │
│    • SI incorrect → Gardien donne un dernier indice                         │
│                                                                             │
│  Essai 3 :                                                                  │
│    • Derniere tentative du tireur                                           │
│    • SI correct → Tireur gagne 40 pts                                       │
│    • SI incorrect → Gardien gagne 40 pts (arret reussi)                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3 : ALTERNANCE                                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Les roles s'inversent avec un nouveau mot secret                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 5. PARCOURS & EXPLORATION

## 5.1 RANDONNEE LEXICALE

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Solo (TYPE C) |
| Questions | 26 (A → Z) |
| Mecanisme | 1 question par lettre |
| Fin | Mauvaise reponse = arret |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RANDONNEE LEXICALE - WORKFLOW                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : DEBUT A → Z                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Pour chaque lettre de l'alphabet :                                         │
│                                                                             │
│  • Question affichee                                                        │
│  • La REPONSE doit commencer par la lettre actuelle                         │
│                                                                             │
│  Exemple :                                                                  │
│    Lettre A : "Capitale de l'Allemagne ?" → "BERLIN" ❌ (ne commence pas    │
│               par A)                                                        │
│    Lettre B : "Capitale de l'Allemagne ?" → "BERLIN" ✓                      │
│                                                                             │
│  SI correct :                                                               │
│    → +10 pts                                                                │
│    → Passage a la lettre suivante                                           │
│                                                                             │
│  SI incorrect :                                                             │
│    → ARRET IMMEDIAT                                                         │
│    → Score final = points accumules                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : VICTOIRE                                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Atteindre Z = victoire complete                                          │
│  • Score max : 260 pts (26 x 10)                                            │
│  • Bonus completion : +100 pts si A→Z sans erreur                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Structure des questions alphabetiques

```typescript
interface AlphabetQuestion {
  letter: string;           // A, B, C, ..., Z
  question: string;
  answer: string;           // Doit commencer par `letter`
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

// Validation
function validateAlphabetAnswer(answer: string, targetLetter: string): boolean {
  const normalized = answer.trim().toUpperCase();
  return normalized.startsWith(targetLetter.toUpperCase());
}
```

---

## 5.2 ECHAPPEE

### Informations generales

| Propriete | Valeur |
|-----------|--------|
| Type | Equipe vs Equipe (TYPE A) |
| Theme | Geographie |
| Questions | 3 a 5 |
| Objectif | Course poursuite |

### Workflow detaille

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ECHAPPEE - WORKFLOW                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONCEPT : Course poursuite geographique                                    │
│  Les equipes progressent sur une carte virtuelle                            │
│                                                                             │
│  PHASE 1 : QUESTIONS GEOGRAPHIQUES                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Questions alternees entre les equipes                                    │
│  • Theme : Geographie (pays, capitales, continents, etc.)                   │
│                                                                             │
│  Bonne reponse → Avance de 1 case                                           │
│  Mauvaise reponse → Reste en place                                          │
│                                                                             │
│  OBJECTIF : Atteindre la destination avant l'adversaire                     │
│                                                                             │
│  Points :                                                                   │
│    • 1er a atteindre l'objectif : +50 pts                                   │
│    • 2eme : +20 pts                                                         │
│    • Bonus rapidite possible                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 6. EVENEMENTS WEBSOCKET

## 6.1 Evenements communs

| Evenement | Direction | Description |
|-----------|-----------|-------------|
| `GAME_START` | S → C | Debut de partie |
| `GAME_END` | S → C | Fin de partie avec resultats |
| `QUESTION_DISPLAY` | S → C | Affichage d'une question |
| `ANSWER_SUBMIT` | C → S | Soumission d'une reponse |
| `ANSWER_RESULT` | S → C | Resultat (correct/incorrect) |
| `SCORE_UPDATE` | S → C | Mise a jour des scores |
| `TIMER_START` | S → C | Demarrage d'un chrono |
| `TIMER_TICK` | S → C | Mise a jour du chrono |
| `TIMER_END` | S → C | Fin du chrono (timeout) |
| `PLAYER_BUZZ` | C → S | Un joueur buzze |
| `BUZZ_CONFIRMED` | S → C | Buzz accepte |

## 6.2 Evenements specifiques par jeu

### Duel

| Evenement | Payload |
|-----------|---------|
| `DUEL_QUESTION` | `{roundNumber, question, timeoutMs}` |
| `DUEL_BUZZ` | `{playerId, timeMs}` |
| `DUEL_ANSWER_WINDOW` | `{buzzerId, timeoutMs}` |

### Jackpot

| Evenement | Payload |
|-----------|---------|
| `JACKPOT_BID_PHASE` | `{questionNumber, maxBidA, maxBidB}` |
| `JACKPOT_BID_SUBMIT` | `{teamId, amount}` |
| `JACKPOT_BIDS_REVEALED` | `{bidA, bidB, responder}` |
| `JACKPOT_INDICE` | `{indiceNumber, text}` |
| `JACKPOT_FLASH_QUESTION` | `{totalPot}` |

### CIME

| Evenement | Payload |
|-----------|---------|
| `CIME_LEVEL` | `{level, question, points, jokersLeft}` |
| `CIME_JOKER_REQUEST` | `{climberId, helperId}` |
| `CIME_JOKER_RESPONSE` | `{helperId, suggestion}` |
| `CIME_QUIT` | `{finalScore}` |
| `CIME_SUMMIT` | `{finalScore, bonus}` |

### Relais

| Evenement | Payload |
|-----------|---------|
| `RELAY_ORDER` | `{playerOrder: Player[]}` |
| `RELAY_TURN` | `{playerId, question, timeoutMs}` |
| `RELAY_CHAIN_BROKEN` | `{atPlayer, scores}` |
| `RELAY_BONUS` | `{team, bonusPoints, totalTime}` |

---

# 7. PROCHAINES ETAPES

1. **Enrichissement du schema de questions**
   - Ajouter les champs `themes`, `categories`, `indices`
   - Migration base de donnees

2. **Implementation par priorite**
   - Phase 1 : Duel, Marathon, Sprint Final (simples)
   - Phase 2 : CIME, Randonnee Lexicale (solo avance)
   - Phase 3 : Panier, Relais (equipe avec themes)
   - Phase 4 : Jackpot, Identification, Estocade (indices)
   - Phase 5 : Saut Patriotique, Capoeira, Tirs au But, Echappee

3. **Creation des questions**
   - Questions par theme
   - Questions par pays
   - Questions a indices
   - Questions alphabetiques
