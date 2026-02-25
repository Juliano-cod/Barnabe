import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("church.db");
const JWT_SECRET = process.env.JWT_SECRET || "church-secret-key-123";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('ADMIN', 'PASTOR', 'LEADER', 'TEAM')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    marital_status TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    neighborhood TEXT,
    city TEXT,
    first_visit_date TEXT,
    invited_by TEXT,
    previous_church TEXT,
    is_baptized INTEGER DEFAULT 0,
    wants_baptism INTEGER DEFAULT 0,
    in_group INTEGER DEFAULT 0,
    interest_ministry TEXT,
    pastoral_notes TEXT,
    status TEXT CHECK(status IN ('VISITOR', 'FOLLOWING', 'DISCIPLESHIP', 'INTEGRATED', 'AWAY')) DEFAULT 'VISITOR',
    assigned_to INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('CALL', 'VISIT', 'COUNSELING', 'EVENT', 'OTHER')) NOT NULL,
    notes TEXT,
    next_contact_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    target_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
  );
`);

// Seed Admin User if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@elo.com");
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Administrador",
    "admin@elo.com",
    hashedPassword,
    "ADMIN"
  );
}

const app = express();
app.use(express.json());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API ROUTES ---

// Auth
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Members
app.get("/api/members", authenticate, (req, res) => {
  const members = db.prepare(`
    SELECT m.*, u.name as assigned_name 
    FROM members m 
    LEFT JOIN users u ON m.assigned_to = u.id
    ORDER BY m.created_at DESC
  `).all();
  res.json(members);
});

app.get("/api/members/:id", authenticate, (req, res) => {
  const member = db.prepare(`
    SELECT m.*, u.name as assigned_name 
    FROM members m 
    LEFT JOIN users u ON m.assigned_to = u.id
    WHERE m.id = ?
  `).get(req.params.id);
  if (!member) return res.status(404).json({ error: "Membro não encontrado" });
  res.json(member);
});

app.post("/api/members", authenticate, (req: any, res) => {
  const { name, dob, gender, marital_status, phone, whatsapp, email, address, neighborhood, city, first_visit_date, invited_by, previous_church, is_baptized, wants_baptism, in_group, interest_ministry, pastoral_notes, status, assigned_to } = req.body;
  
  const assignedToValue = assigned_to === "" || assigned_to === undefined ? null : assigned_to;

  const result = db.prepare(`
    INSERT INTO members (name, dob, gender, marital_status, phone, whatsapp, email, address, neighborhood, city, first_visit_date, invited_by, previous_church, is_baptized, wants_baptism, in_group, interest_ministry, pastoral_notes, status, assigned_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, dob, gender, marital_status, phone, whatsapp, email, address, neighborhood, city, first_visit_date, invited_by, previous_church, is_baptized ? 1 : 0, wants_baptism ? 1 : 0, in_group ? 1 : 0, interest_ministry, pastoral_notes, status || 'VISITOR', assignedToValue);

  db.prepare("INSERT INTO audit_logs (user_id, action, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)")
    .run(req.user.id, "CREATE", "members", result.lastInsertRowid, `Created member: ${name}`);

  res.json({ id: result.lastInsertRowid });
});

app.put("/api/members/:id", authenticate, (req: any, res) => {
  const { id } = req.params;
  const { name, dob, gender, marital_status, phone, whatsapp, email, address, neighborhood, city, first_visit_date, invited_by, previous_church, is_baptized, wants_baptism, in_group, interest_ministry, pastoral_notes, status, assigned_to } = req.body;
  
  const assignedToValue = assigned_to === "" || assigned_to === undefined ? null : assigned_to;

  db.prepare(`
    UPDATE members SET 
      name = ?, dob = ?, gender = ?, marital_status = ?, phone = ?, whatsapp = ?, email = ?, 
      address = ?, neighborhood = ?, city = ?, first_visit_date = ?, invited_by = ?, 
      previous_church = ?, is_baptized = ?, wants_baptism = ?, in_group = ?, 
      interest_ministry = ?, pastoral_notes = ?, status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, dob, gender, marital_status, phone, whatsapp, email, address, neighborhood, city, first_visit_date, invited_by, previous_church, is_baptized ? 1 : 0, wants_baptism ? 1 : 0, in_group ? 1 : 0, interest_ministry, pastoral_notes, status, assignedToValue, id);

  db.prepare("INSERT INTO audit_logs (user_id, action, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)")
    .run(req.user.id, "UPDATE", "members", id, `Updated member: ${name}`);

  res.json({ success: true });
});

app.get("/api/members/:id/contacts", authenticate, (req, res) => {
  const contacts = db.prepare(`
    SELECT c.*, u.name as user_name 
    FROM contacts c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.member_id = ? 
    ORDER BY c.created_at DESC
  `).all(req.params.id);
  res.json(contacts);
});

app.post("/api/members/:id/contacts", authenticate, (req: any, res) => {
  const { id } = req.params;
  const { type, notes, next_contact_date } = req.body;
  db.prepare("INSERT INTO contacts (member_id, user_id, type, notes, next_contact_date) VALUES (?, ?, ?, ?, ?)")
    .run(id, req.user.id, type, notes, next_contact_date);
  res.json({ success: true });
});

// Users (Team)
app.get("/api/users", authenticate, (req, res) => {
  const users = db.prepare("SELECT id, name, email, role, created_at FROM users").all();
  res.json(users);
});

// Stats
app.get("/api/stats", authenticate, (req, res) => {
  const totalMembers = db.prepare("SELECT COUNT(*) as count FROM members").get() as any;
  const visitors = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'VISITOR'").get() as any;
  const integrated = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'INTEGRATED'").get() as any;
  const discipleship = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'DISCIPLESHIP'").get() as any;
  
  const neighborhoodStats = db.prepare("SELECT neighborhood, COUNT(*) as count FROM members GROUP BY neighborhood").all();
  const statusStats = db.prepare("SELECT status, COUNT(*) as count FROM members GROUP BY status").all();

  res.json({
    total: totalMembers.count,
    visitors: visitors.count,
    integrated: integrated.count,
    discipleship: discipleship.count,
    neighborhoods: neighborhoodStats,
    statuses: statusStats
  });
});

// Messages
app.get("/api/messages", authenticate, (req: any, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.name as sender_name 
    FROM messages m 
    JOIN users u ON m.sender_id = u.id 
    WHERE m.recipient_id = ? OR m.sender_id = ?
    ORDER BY m.created_at DESC
  `).all(req.user.id, req.user.id);
  res.json(messages);
});

app.post("/api/messages", authenticate, (req: any, res) => {
  const { recipient_id, content } = req.body;
  const recipientIdValue = recipient_id === "" || recipient_id === undefined ? null : recipient_id;
  
  db.prepare("INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)")
    .run(req.user.id, recipientIdValue, content);
  res.json({ success: true });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
