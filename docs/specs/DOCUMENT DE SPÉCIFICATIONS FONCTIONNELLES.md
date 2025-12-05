# **📘**

# **MINDSOCCER – DOCUMENT DE SPÉCIFICATIONS FONCTIONNELLES**

# **\#️⃣ 1\. INTRODUCTION**

## **🎯 Objectif du document**

Décrire l’ensemble des écrans, comportements, règles métier, parcours utilisateurs et navigation de l’application **MindSoccer**, une plateforme de jeu d’agilité mentale multijoueur, compétitive et en temps réel.

## **🧩 Vision produit**

MindSoccer est un système de jeux cognitifs inspirés d’émissions télé, conçu pour :

* favoriser la rapidité mentale

* renforcer les connaissances générales et linguistiques

* développer l’esprit d’équipe

* permettre des affrontements compétitifs en ligne

Le produit propose :

* des **équipes réelles**, composées de **joueurs connectés**

* des modes de jeu basés sur **réflexe**, **thèmes**, **énigmes**, **duels**

* un système de **classement global**, **saisonnier** et **par équipe**

* une approche esthétique futuriste, néon, holographique

# **\#️⃣ 2\. WORKFLOWS MISES À JOUR (AVEC DISTINCTION JEUX SOLO / 1V1 / ÉQUIPES)**

## **🟦 2.1 — Workflow global d’accès**

`Page d'accueil`  
   `↓ (Bouton “Démarrer session”)`  
`Si session active :`  
        `→ Page des modes`  
`Sinon :`  
        `→ Connexion / Inscription`  
            `↓`  
        `→ Page des modes`

---

# **\#️⃣ 2.2 — Workflow du choix d’un mode de jeu**

`Modes de jeu (4 catégories)`  
   `↓`  
`Clique sur une catégorie`  
   `↓`  
`Liste des jeux associés`  
   `↓`  
`Clique sur un jeu`  
   `↓`  
`Page des règles du jeu`  
   `↓`  
`Bouton “Lancer le jeu”`

---

# **\#️⃣ 2.3 — Workflow adapté selon le TYPE DE JEU**

Chaque jeu appartient à l’un des 3 types ci-dessous :

---

# **🟩 TYPE A — JEUX EN ÉQUIPE (nécessitent 2 équipes)**

### **Jeux concernés :**

* Smash A

* Smash B

* Marathon (version équipe)

* Relais

* Panier (si plusieurs équipes s’affrontent)

* Saut Patriotique

* Échappée (version équipe)

* Estocade (version équipe)

* Sprint Final (version équipe)

### **Workflow :**

`Page règles`  
`↓`  
`Choisir : Créer une équipe ou Rejoindre une équipe`  
`↓`  
`Équipe créée / rejointe`  
`↓`  
`Choisir équipe adverse (même taille max)`  
`↓`  
`Lobby commun (attente des 2 équipes complètes)`  
`↓`  
`Capitaine clique “Lancer le jeu”`  
`↓`  
`Match`  
`↓`  
`Résultats`

### **Contraintes :**

* 1 à 5 joueurs par équipe

* Smash : adversaire doit avoir **taille identique**

* Lobby doit être **complet** avant lancement

---

## **📋 Détail du flux Création d'Équipe et Lobby**

### **Étape 1 : Création de l'équipe**

Lors de la création d'une équipe, le créateur (futur capitaine) doit obligatoirement spécifier :

| Paramètre | Description | Valeurs possibles |
|-----------|-------------|-------------------|
| **Nombre de joueurs max** | Taille maximale de chaque équipe | 1, 2, 3, 4 ou 5 |
| **Mode** | Partie classée ou amicale | Ranked / Casual |

> ⚠️ **Important** : Ce nombre définit la taille requise pour **les deux équipes**. Une fois défini, il ne peut plus être modifié.

### **Étape 2 : Choix de l'équipe adverse**

Après création, le créateur choisit une équipe adverse parmi :
- Les équipes en attente ayant la **même taille maximale**
- Ou génère un code pour inviter une équipe à rejoindre

### **Étape 3 : Lobby d'attente**

Une fois les deux équipes associées, tous les joueurs sont dans un **lobby commun** où ils attendent que les conditions de démarrage soient remplies.

#### **Conditions de démarrage :**

```
┌─────────────────────────────────────────────────────────────────┐
│           LES DEUX ÉQUIPES DOIVENT ÊTRE COMPLÈTES               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Exemple pour un match 3v3 :                                    │
│                                                                  │
│    Équipe A: [●][●][○]  2/3 joueurs                             │
│    Équipe B: [●][●][●]  3/3 joueurs ✓                           │
│                                                                  │
│    → Match NON prêt (Équipe A incomplète)                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Équipe A: [●][●][●]  3/3 joueurs ✓                           │
│    Équipe B: [●][●][●]  3/3 joueurs ✓                           │
│                                                                  │
│    → Match PRÊT - Le capitaine peut lancer                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### **Affichage du lobby :**

- Liste des joueurs de chaque équipe avec indicateur du capitaine (👑)
- Compteur de joueurs par équipe (ex: "2/5 joueurs")
- Statut de chaque équipe : "En attente" ou "Prête"
- Code du match (partageable)
- Bouton "Lancer le jeu" (visible uniquement quand les deux équipes sont complètes, réservé au capitaine)

#### **Règles du lobby :**

1. Le match **ne peut pas démarrer** tant que les deux équipes n'ont pas atteint le nombre de joueurs défini
2. Un joueur peut quitter le lobby à tout moment avant le lancement
3. **Le premier joueur à rejoindre une équipe devient automatiquement capitaine** de cette équipe
4. Si le capitaine quitte, le rôle est transféré au joueur suivant de l'équipe
5. Les notifications en temps réel informent des arrivées/départs de joueurs
6. **N'importe quel capitaine** (de l'équipe A ou B) peut lancer le match une fois les deux équipes complètes

---

# **🟨 TYPE B — JEUX 1 VS 1 (DUELS)**

### **Jeux concernés :**

* Duel linguistique

* Identification

* Tirs au but (version duel)

* Jackpot (si paramétré en duel)

### **Workflow :**

`Page règles`  
`↓`  
`Choisir adversaire (liste des joueurs disponibles)`  
`↓`  
`Connexion automatique au lobby duel`  
`↓`  
`Lancement automatique quand les 2 joueurs sont prêts`  
`↓`  
`Duel`  
`↓`  
`Résultats`

### **Contraintes :**

* Aucun système d’équipe

* 2 joueurs maximum

* Le lobby ne montre que 2 slots

---

# **🟧 TYPE C — JEUX SOLO OU ÉQUIPE-SOLO**

### **Jeux concernés :**

* Panier (classement individuel)

* CIME

* Randonnée Lexicale

* Marathon solo

* Estocade solo

* Identification solo

* Échappée solo

### **Workflow :**

`Page règles`  
`↓`  
`Bouton “Commencer”`  
`↓`  
`Lancement immédiat du jeu`  
`↓`  
`Résultats`  
`↓`  
`Mise à jour du score global + saison`

### **Contraintes :**

* Pas de lobby

* Pas d’équipe

* Session purement personnelle

---

---

# **\#️⃣ 3\. RÈGLES MÉTIER PAR JEUX** 

➡️  *CLASSIFICATION PAR TYPE*

---

# **🟥 TYPE A — JEUX EN ÉQUIPE**

---

# **SMASH A** (avec concertation)

### **🎯 Objectif**

Coller l'équipe adverse avec une question vérifiable inventée par l'équipe.

### **🔧 Structure du match**

Chaque équipe pose **1 question** à tour de rôle. L'équipe qui a lancé le match commence.
Score maximum possible : **20 points** (10 pts par tour).

### **📋 Workflow détaillé d'un tour**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ÉQUIPE QUI POSE (Attaquant)           ÉQUIPE QUI RÉPOND (Défenseur)        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1 : CONCERTATION                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • L'équipe se concerte (temps illimité)                                    │
│  • Peut inventer une question OU choisir dans la base                       │
│  • Quand prête, le capitaine clique [TOP]                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2 : ANNONCE DE LA QUESTION (3 secondes)                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • L'équipe a 3s pour écrire/poser sa question                              │
│  • ⚠️ Si timeout (>3s) → Défenseur gagne 10 pts → FIN DU TOUR              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3 : VALIDATION DE LA QUESTION (3 secondes)                           │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le défenseur voit la question                                            │
│  • Il doit cliquer [VALIDER] ou [INVALIDER] en 3s                           │
│  • Si [INVALIDER] : doit fournir une raison                                 │
│  • ⚠️ Si INVALIDE → Défenseur gagne 10 pts → FIN DU TOUR                   │
│  • ✅ Si VALIDE → Continue à Phase 4                                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 4 : RÉPONSE (10 secondes)                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Le défenseur a 10s pour répondre                                         │
│  • Saisie de la réponse dans un champ texte                                 │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 5 : VALIDATION DE LA RÉPONSE                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • L'attaquant valide la réponse : [CORRECT] ou [INCORRECT]                 │
│  • ✅ Si CORRECT → Défenseur gagne 10 pts                                   │
│  • ❌ Si INCORRECT → 0 pts pour les deux                                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  FIN DU TOUR → Les rôles s'inversent pour le Tour 2                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **🏆 Victoire**

L'équipe totalisant le plus de points à la fin des 2 tours.

### **📊 Tableau des points**

| Situation | Points Attaquant | Points Défenseur |
|-----------|------------------|------------------|
| Timeout annonce question (>3s) | 0 | +10 |
| Question invalidée | 0 | +10 |
| Réponse correcte | 0 | +10 |
| Réponse incorrecte | 0 | 0 |

---

# **SMASH B** (sans concertation)

### **🎯 Objectif**

Mode pression pure. Même principe que SMASH A mais sans temps de concertation.

### **🔧 Différences avec SMASH A**

| Aspect | SMASH A | SMASH B |
|--------|---------|---------|
| Concertation | Temps illimité | Aucune |
| Bouton TOP | Oui (déclenche le chrono) | Non |
| Début du tour | Après clic sur TOP | Immédiat (3s pour poser) |

### **📋 Workflow simplifié**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Le tour commence DIRECTEMENT avec 3s pour poser la question                │
│  (pas de phase concertation, pas de bouton TOP)                             │
│                                                                             │
│  Le reste du workflow est IDENTIQUE à SMASH A :                             │
│  • Phase validation question (3s)                                           │
│  • Phase réponse (10s)                                                      │
│  • Phase validation réponse                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **🏆 Victoire**

L'équipe totalisant le plus de points à la fin des 2 tours.

---

# **PANIER (VERSION ÉQUIPE)**

### **🎯 Objectif**

4 questions, un tireur unique.

### **🔧 Règles métier**

* L’équipe en tête choisit le thème

* 1 seul joueur répond

* Pas d’aide

### **🏆 Points**

* 10 × bonnes

* 4/4 \= \+10 bonus

---

# **RELAIS**

### **🎯 Objectif**

Répondre sans faute.

### **🔧 Règles métier**

* L’équipe menée choisit le thème

* Réponses en chaîne par différents joueurs

* Temps total ≤40 s pour bonus

### **🏆 Points**

\+20 bonus si sans faute \+ rapide

---

# **SAUT PATRIOTIQUE**

### **🎯 Objectif**

Série de questions sur le pays de l'équipe en tête.

### **🔧 Règles**

* Après lecture du thème : *“En voulez-vous ?”* Oui/Non

* Mauvaise réponse \= annule la précédente bonne

---

# **ÉCHAPPÉE (Équipe)**

### **🎯 Objectif**

Réussir la clé du continent.

### **🔧 Règles**

* 3 à 5 questions géographiques

* Progression vers un objectif

---

# **ESTOCADE (Équipe)**

### **🎯 Objectif**

3 questions très difficiles.

### **🧠 Règles**

* 3 questions

* 1 indice max

### **🏆 Points**

40 par question

---

# **SPRINT FINAL (Équipe)**

### **🎯 Objectif**

Phase finale ultra-rapide.

### **🔧 Règles**

* 20 questions éclair

* Temps ultra court

### **🏆 Points**

Bonne \= \+2 | Mauvaise \= \-1

---

# **🟦 TYPE B — JEUX 1 VS 1**

---

# **DUEL LINGUISTIQUE**

### **🎯 Objectif**

Face-à-face basé sur vitesse et connaissances linguistiques.

### **🔧 Règles**

* 1 question par round

* 3–10 rounds

* Le plus rapide marque des points

### **🏆 Points**

Bonne \= \+10  
 Mauvaise \= \-5  
 Bonus rapidité : \+1 à \+3

---

# **IDENTIFICATION (Duel)**

### **🎯 Objectif**

Trouver la réponse avec un minimum d’indices.

### **🔧 Règles**

* 4 indices : 40 / 30 / 20 / 10

* Une seule tentative

---

# **TIRS AU BUT (Duel)**

### **🎯 Objectif**

Deviner un mot secret.

### **🔧 Règles**

* L’adversaire joue rôle de gardien

* 3 essais

### **🏆 Points**

Réussite \= \+40

---

# **JACKPOT (Duel)**

### **🎯 Objectif**

Jeu d’enchères.

### **🔧 Règles**

* Mise de 100 points par équipe

* 3 indices

* Mauvaise réponse → perte totale

---

# **🟧 TYPE C — JEUX SOLO**

---

# **CIME**

### **🎯 Objectif**

10 questions de difficulté croissante.

### **🔧 Règles**

* 3 jokers

* Choix entre quitter ou doubler

---

# **RANDONNÉE LEXICALE**

### **🎯 Objectif**

Parcourir l’alphabet de A à Z.

### **🔧 Règles**

* 10 questions

* Mauvaise réponse → arrêt

---

# **MARATHON (solo)**

### **🎯 Objectif**

Endurance mentale.

### **🔧 Règles**

* 10 questions

* Pas de chrono

---

---

# **\#️⃣ 4\. WORKFLOWS PAR TYPE DE JEU (MISE À JOUR)**

---

# **🟩 Workflow Jeux Équipe vs Équipe**

`Règles → Créer/Rejoindre équipe → Choisir adversaire → Lobby → Match → Résultats`

---

# **🟨 Workflow Jeux 1v1**

`Règles → Choisir adversaire → Lobby duel → Match → Résultats`

---

# **🟧 Workflow Jeux Solo**

`Règles → Commencer → Match → Résultats`

---

