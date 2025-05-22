CREATE TABLE IF NOT EXISTS invitados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  mesa INTEGER NOT NULL,
  email TEXT,
  telefono TEXT,
  confirmada_asistencia BOOLEAN NOT NULL DEFAULT 0,
  wedding_code TEXT NOT NULL
);

