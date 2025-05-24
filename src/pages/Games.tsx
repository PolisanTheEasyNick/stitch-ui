import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { NavigateBefore, NavigateNext, LastPage } from "@mui/icons-material";

const API_URL = "https://api.polisan.dev/config/games";

type GameItem = {
  steam_id: string;
  name: string;
  emoji_id: string;
  color: string;
};

export default function Games() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [originalGames, setOriginalGames] = useState<GameItem[]>([]);
  const [editedGames, setEditedGames] = useState<Map<number, GameItem>>(
    new Map()
  );
  const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());
  const [newGames, setNewGames] = useState<GameItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingGame, setEditingGame] = useState<GameItem>({
    steam_id: "",
    name: "",
    emoji_id: "",
    color: "#ffffff",
  });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const gamesPerPage = 10;

  const displayedGames = games.slice(
    page * gamesPerPage,
    (page + 1) * gamesPerPage
  );

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
        setOriginalGames(data);
      })
      .catch(() => {
        setGames([]);
        setOriginalGames([]);
      });
  }, []);

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingGame(games[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingGame({
      steam_id: "",
      name: "",
      emoji_id: "",
      color: "#ffffff",
    });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    const updated = [...games];
    updated[editingIndex] = editingGame;
    setGames(updated);

    if (editingIndex < originalGames.length) {
      const updatedMap = new Map(editedGames);
      updatedMap.set(editingIndex, editingGame);
      setEditedGames(updatedMap);
    } else {
      const idx = editingIndex - originalGames.length;
      const updatedNew = [...newGames];
      updatedNew[idx] = editingGame;
      setNewGames(updatedNew);
    }

    cancelEditing();
  };

  const deleteGame = (index: number) => {
    const updated = games.filter((_, i) => i !== index);
    setGames(updated);

    if (index < originalGames.length) {
      setDeletedIndices(new Set(deletedIndices).add(index));
      editedGames.delete(index);
    } else {
      setNewGames(
        newGames.filter((_, i) => i !== index - originalGames.length)
      );
    }

    if (editingIndex === index) cancelEditing();
  };

  const addGame = () => {
    const newIndex = games.length;
    const blank: GameItem = {
      steam_id: "",
      name: "",
      emoji_id: "",
      color: "#ffffff",
    };
    setGames([...games, blank]);
    setNewGames([...newGames, blank]);
    setEditingIndex(newIndex);
    setEditingGame(blank);
  };

  const saveGamesToServer = async () => {
    if (editingIndex !== null) {
      alert("Finish editing before saving.");
      return;
    }

    setSaving(true);
    try {
      for (const index of deletedIndices) {
        await fetch(`${API_URL}/${index}`, { method: "DELETE" });
      }

      for (const [index, game] of editedGames.entries()) {
        await fetch(`${API_URL}/edit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index, game }),
        });
      }

      for (const game of newGames) {
        await fetch(`${API_URL}/add`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(game),
        });
      }

      alert("Games synced successfully!");

      const res = await fetch(API_URL);
      const updated = await res.json();
      setGames(updated);
      setOriginalGames(updated);
      setEditedGames(new Map());
      setDeletedIndices(new Set());
      setNewGames([]);
    } catch (e: any) {
      alert(`Error saving games: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 4,
        height: "100%",
        minHeight: 0,
        "& .MuiTypography-root": { color: "white" },
        "& .MuiListItemText-primary": { color: "white" },
        "& .MuiListItem-root": { color: "white" },
        "& .MuiIconButton-root": { color: "white" },
        "& .MuiFormControlLabel-label": { color: "white" },
        "& .MuiSwitch-switchBase": { color: "white" },
        "& .MuiSwitch-track": { backgroundColor: "rgba(255,255,255,0.3)" },
        "& .MuiButton-root": { color: "white" },
        "& .MuiInputBase-root": { color: "white" },
        "& .MuiInputLabel-root": { color: "white" },
        "& .MuiFormHelperText-root": { color: "white" },
      }}
    >
      {/* Top title */}
      <Box>
        <Typography variant="h4" mb={2}>
          Games Configurator
        </Typography>
      </Box>

      {/* Middle list content fills all space */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          minHeight: 0,
          scrollbarWidth: "none",
        }}
      >
        <List>
          {displayedGames.map((game, i) => {
            const globalIndex = page * gamesPerPage + i;
            const isEditing = editingIndex === globalIndex;

            return (
              <ListItem
                key={`game-${globalIndex}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                }}
                onDoubleClick={() => startEditing(globalIndex)}
                secondaryAction={
                  <IconButton
                    onClick={() => deleteGame(globalIndex)}
                    edge="end"
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                {isEditing ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    <TextField
                      label="Steam ID"
                      value={editingGame.steam_id}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          steam_id: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Name"
                      value={editingGame.name}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          name: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Emoji ID"
                      value={editingGame.emoji_id}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          emoji_id: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Color"
                      type="color"
                      value={editingGame.color}
                      onChange={(e) =>
                        setEditingGame({
                          ...editingGame,
                          color: e.target.value,
                        })
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button onClick={saveEdit}>Save</Button>
                      <Button onClick={cancelEditing}>Cancel</Button>
                    </Box>
                  </Box>
                ) : (
                  <ListItemText
                    primary={`${game.name} (${game.steam_id})`}
                    secondary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>Emoji: {game.emoji_id}, Color:</span>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "4px",
                            backgroundColor: game.color,
                            border: "1px solid white",
                          }}
                        />
                        <span>{game.color}</span>
                      </Box>
                    }
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom section */}
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            justifyContent: "space-between",
            mt: 2,
            alignItems: "center",
          }}
        >
          <Button variant="contained" onClick={addGame}>
            Add Game
          </Button>
          <Button
            variant="contained"
            onClick={saveGamesToServer}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Games"}
          </Button>

          <Button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            sx={{
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.5)",
              },
            }}
          >
            <NavigateBefore />
          </Button>
          <Typography>
            Page {page + 1} /{" "}
            {Math.max(1, Math.ceil(games.length / gamesPerPage))}
          </Typography>
          <Button
            onClick={() =>
              setPage((p) =>
                Math.min(p + 1, Math.floor((games.length - 1) / gamesPerPage))
              )
            }
            disabled={page >= Math.floor((games.length - 1) / gamesPerPage)}
            sx={{
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.5)",
              },
            }}
          >
            <NavigateNext />
          </Button>
          <Button
            onClick={() =>
              setPage(Math.floor((games.length - 1) / gamesPerPage))
            }
            disabled={page >= Math.floor((games.length - 1) / gamesPerPage)}
            sx={{
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.5)",
              },
            }}
          >
            <LastPage />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
