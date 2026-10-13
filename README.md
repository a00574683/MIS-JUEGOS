# Mis Juegos ✦

Cuatro juegos clásicos en un solo lugar, con un diseño minimalista claro. Hecho con **HTML + CSS + JS** puro, sin dependencias ni servidor.

**Juegos incluidos:** Tetris · Snake · Gato (2 jugadores) · Ping Pong (2 jugadores)

## Preview

Home con 4 tarjetas. Toca una para entrar al juego y usa `← Volver` para regresar.

## Estructura

```
.
├── index.html   # Home + los 4 juegos
├── styles.css   # Estilo minimalista claro
└── app.js       # Navegación + lógica de los juegos
```

## Cómo jugarlo

1. Descarga o clona el repositorio.
2. Abre `index.html` en tu navegador (doble click, sin servidor).
3. Elige un juego y pulsa **Iniciar**.

## Controles

| Juego | Controles |
|---|---|
| Tetris | `←` `→` mover · `↑` rotar · `↓` bajar · `Espacio` caer · `P` pausa |
| Snake | Flechas o `WASD` |
| Gato | Click por turnos, `X` empieza |
| Ping Pong | P1: `W`/`S` · P2: `▲`/`▼` · Gana quien llegue a 5 |

Todos tienen botones en pantalla para jugar en móvil.

## Tecnologías

- HTML5 semántico
- CSS3 (grid, flex, responsive)
- JavaScript + Canvas API
- Fuente: Inter

## Personalizar

- Colores y espaciados en `:root` dentro de `styles.css`.
- Velocidad/dificultad: `tDropInterval` (Tetris), `setInterval` (Snake), `WIN_SCORE` (Pong) en `app.js`.
