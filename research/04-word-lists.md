# Category Word Lists for WordPool

**Research Summary:** Free JSON sources: Datamuse API (semantic words), WordDB GitHub lists, ENABLE/Scrabble dicts. Structure: Nested by category > difficulty (6 levels: broad to specific). 20-50 words/level recommended for game balance.

**JSON Structure Example:**
```json
{
  "Animals": {
    "1": ["dog", "cat", "bird", "fish", "lion", "bear"],
    "2": ["mammal", "reptile", "amphibian", "insect"],
    "3": ["wild", "farm", "pet", "zoo"],
    "4": ["carnivore", "herbivore", "omnivore"],
    "5": ["african", "arctic", "ocean", "forest"],
    "6": ["elephant", "giraffe", "hippo", "rhino"]
  },
  "Food": {
    "1": ["apple", "banana", "pizza", "burger", "soup"],
    // ... 6 levels
  }
  // Full: Animals, Food&Cooking, Transportation, Nature&Plants, Occupations, Sports&Activities
}
```

**Sample Full Lists (Animals & Food):** Use Datamuse API: `https://api.datamuse.com/words?rel_jja=animals&max=50` for dynamic, or static below.

**Animals (excerpt, all levels 20+ words):**
- Level 1: dog, cat, horse, cow, pig, sheep, goat, chicken, duck, turkey, rabbit, mouse, rat, squirrel, deer, fox, wolf, bear, lion, tiger...
- Level 6 (Large African Carnivores): lion, leopard, cheetah, hyena (expand via sources).

**Food & Cooking:**
- Level 1: apple, bread, milk, egg, rice, pasta, cheese, butter, sugar, salt...
- Level 6 (French Pastries): croissant, eclair, macaron, crepe, tart, souffle...

**Sources & Download:** [Datamuse API](https://api.datamuse.com/) [web:27], [ ENABLE word list JSON](https://github.com/dwyl/english-words) [web:28], [WordDB categories](https://github.com/hermitdave/FrequencyWords) [web:29]. Import as JSON for app.