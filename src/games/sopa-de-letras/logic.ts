import type {
  SopaConfig,
  SopaState,
  SopaWord,
  Direction,
  SopaSelectAction,
} from "./types";

// ─── Spanish word lists by category ───

const WORD_LISTS: Record<string, string[]> = {
  general: [
    "ESCUELA",
    "CIENCIA",
    "HISTORIA",
    "PLANETA",
    "OCEANO",
    "MONTAÑA",
    "BOSQUE",
    "ANIMAL",
    "MUSICA",
    "PINTURA",
    "LENGUA",
    "NUMERO",
    "ENERGIA",
    "ATOMO",
    "CELULA",
    "TIERRA",
    "VOLCAN",
    "COMETA",
    "ESTRELLA",
    "GALAXIA",
    "SISTEMA",
    "CULTURA",
    "LITORAL",
    "CUMBRE",
    "SELVA",
    "FLORA",
    "FAUNA",
    "CLIMA",
    "MAPA",
    "ROCA",
    "ISLA",
    "LAGO",
    "MESA",
    "LIBRO",
    "LAPIZ",
    "RELOJ",
    "BARCO",
    "AVION",
    "PUENTE",
    "TORRE",
  ],
};

const DIRECTIONS: Direction[] = [
  "horizontal",
  "vertical",
  "diagonal-down",
  "diagonal-up",
];

const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

function getDirectionDelta(dir: Direction): [number, number] {
  switch (dir) {
    case "horizontal":
      return [0, 1];
    case "vertical":
      return [1, 0];
    case "diagonal-down":
      return [1, 1];
    case "diagonal-up":
      return [-1, 1];
  }
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction
): boolean {
  const size = grid.length;
  const [dr, dc] = getDirectionDelta(dir);

  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] !== "" && grid[r][c] !== word[i]) return false;
  }
  return true;
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  dir: Direction
): void {
  const [dr, dc] = getDirectionDelta(dir);
  for (let i = 0; i < word.length; i++) {
    grid[row + dr * i][col + dc * i] = word[i];
  }
}

export function generateGrid(config: SopaConfig): {
  grid: string[][];
  words: SopaWord[];
} {
  const { gridSize, wordCount, category } = config;
  const grid: string[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill("")
  );

  const wordPool = shuffle(WORD_LISTS[category] || WORD_LISTS.general).filter(
    (w) => w.length <= gridSize
  );

  const placedWords: SopaWord[] = [];
  let attempts = 0;
  const maxAttempts = 500;

  for (const word of wordPool) {
    if (placedWords.length >= wordCount) break;
    if (attempts > maxAttempts) break;

    const shuffledDirs = shuffle([...DIRECTIONS]);

    let placed = false;
    for (const dir of shuffledDirs) {
      if (placed) break;

      const [dr, dc] = getDirectionDelta(dir);

      // Calculate valid start positions
      const positions: [number, number][] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (canPlaceWord(grid, word, r, c, dir)) {
            positions.push([r, c]);
          }
        }
      }

      if (positions.length > 0) {
        const [row, col] =
          positions[Math.floor(Math.random() * positions.length)];
        placeWord(grid, word, row, col, dir);
        placedWords.push({
          word,
          startRow: row,
          startCol: col,
          direction: dir,
          foundBy: null,
        });
        placed = true;
      }

      attempts++;
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, words: placedWords };
}

export function checkSelection(
  state: SopaState,
  action: SopaSelectAction,
  playerId: string
): SopaWord | null {
  const { startRow, startCol, endRow, endCol } = action;

  // Determine direction from selection
  const dr = Math.sign(endRow - startRow);
  const dc = Math.sign(endCol - startCol);

  // Must be a valid line (horizontal, vertical, or diagonal)
  const rowDiff = Math.abs(endRow - startRow);
  const colDiff = Math.abs(endCol - startCol);

  if (rowDiff !== 0 && colDiff !== 0 && rowDiff !== colDiff) return null;

  // Build selected string
  const length = Math.max(rowDiff, colDiff) + 1;
  let selected = "";
  for (let i = 0; i < length; i++) {
    const r = startRow + dr * i;
    const c = startCol + dc * i;
    if (r < 0 || r >= state.gridSize || c < 0 || c >= state.gridSize)
      return null;
    selected += state.grid[r][c];
  }

  // Check if it matches any unfound word
  for (const word of state.words) {
    if (word.foundBy !== null) continue;

    if (selected === word.word) {
      // Verify position matches
      if (word.startRow === startRow && word.startCol === startCol) {
        return word;
      }
    }

    // Check reverse
    const reversed = selected.split("").reverse().join("");
    if (reversed === word.word) {
      return word;
    }
  }

  return null;
}

export function isAllWordsFound(state: SopaState): boolean {
  return state.words.every((w) => w.foundBy !== null);
}

export function calculateScores(state: SopaState): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const id of state.playerIds) {
    scores[id] = 0;
  }
  for (const word of state.words) {
    if (word.foundBy) {
      scores[word.foundBy] = (scores[word.foundBy] || 0) + 1;
    }
  }
  return scores;
}
