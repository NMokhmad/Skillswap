# LinkedIn Post Generator — Prompt pour Claude Code

## Contexte
Tu vas analyser ce projet codebase et générer des posts LinkedIn à partir de ce que tu y trouves réellement : 
problèmes techniques concrets rencontrés, décisions d'architecture, bugs résolus, patterns utilisés, apprentissages.

## Ce que tu dois faire

1. **Explore le projet** : lis les fichiers clés (README, code source, commits récents si dispo, structure des dossiers)
2. **Extrais 5 à 10 insights bruts** : des faits concrets, pas des généralités ("j'ai utilisé Argon2 parce que bcrypt a un problème de timing attack précis", pas "j'ai sécurisé mon app")
3. **Pour chaque insight, génère un post LinkedIn**

## Règles de rédaction — STRICT

### Ce que le post DOIT faire
Commencer par une accroche en 1-2 phrases maximum qui pose 
le problème AVANT de l'expliquer. Deux formats qui marchent :

- Chiffres bruts + conséquence immédiate :
  "X ms ou Y ms selon l'email entré. Tu viens d'offrir 
  un annuaire public à n'importe quel attaquant."
  
- Symptôme invisible + tension :
  "Aucune erreur dans les logs. Aucun test qui échoue. 
  Juste [détail concret qui cache le vrai problème]."

Jamais : "J'ai réalisé que...", "J'ai découvert que...", 
"En travaillant sur..."
- Raconter une mini-histoire avec un avant/après ou une tension
- Avoir une conclusion utile et spécifique, pas morale
- Parler à un dev junior ou mid qui galère sur le même truc
- Utiliser le "je" assumé, pas le "nous" corporate

### Ce que le post NE DOIT PAS faire
- Jamais commencer par "Dans le monde du développement..."
- Jamais écrire "En tant que développeur, j'ai appris que..."
- Zéro bullet points avec des emojis checkmark ✅
- Zéro phrase du type "La clé du succès c'est...", "Le vrai secret c'est..."
- Pas de liste de 5 conseils génériques
- Pas de faux suspense ("La réponse va vous surprendre")
- Pas de ton coach de vie
- Pas de hashtags en milieu de texte

### Format attendu
- 150 à 250 mots max
- 3 à 5 paragraphes courts (2-3 lignes chacun)
- 3 à 5 hashtags pertinents EN FIN de post seulement
- Ton : direct, technique, humain — comme un dev qui parle à un autre dev

## Output attendu

Pour chaque post :
```
---
INSIGHT SOURCE : [nom du fichier ou feature concernée]
ANGLE : [le vrai problème ou décision technique]

POST :
[le texte du post]
---
```

Génère-moi 5 posts en commençant par les sujets les plus concrets et différenciants du projet.

- Si le post contient du code, le placer APRÈS la conclusion, 
  jamais au milieu du texte narratif. Le code est une annexe 
  pour les devs qui veulent implémenter, pas un élément du récit.