import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import bcrypt from "bcrypt";
import db from "./db.js";
import { signToken, requireAuth } from "./middleware/auth.js";
import shoppingRoutes from "./routes/shopping.js";
import reportRoutes from "./routes/reports.js";
import branchRoutes from "./routes/branches.js";

dotenv.config();

const app = express();
const saltRounds = 10;

// ── CORS ────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:8080",
  credentials: true,
}));
app.use(express.json());

// ── Passport (Google OAuth only — sessions for OAuth redirect flow) ───
import session from "express-session";
app.use(session({ secret: process.env.SESSION_SECRET || "dev", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (_accessToken, _refreshToken, profile, cb) => {
      try {
        const existing = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
        let user;
        if (existing.rows.length === 0) {
          const result = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING *",
            [profile.displayName, profile.email, "google_oauth"]
          );
          user = result.rows[0];
          console.log(`Success ---- New user added successfully to DB`);
        } else {
          user = existing.rows[0];
        }
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

// ── Auth routes ─────────────────────────────────

// Register (email/password)
app.post("/register", async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  try {
    const exists = await db.query("SELECT id FROM users WHERE email = $1", [username]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hash = await bcrypt.hash(password, saltRounds);
    const result = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING id, name, email, role",
      [name, username, hash]
    );
    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ user, token });
    console.log(`Success ---- New user added successfully to DB (mail, password)`);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login (email/password)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const user = result.rows[0];
    if (user.password === "google_oauth") {
      return res.status(401).json({ message: "This account uses Google sign-in" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
    console.log(`Success ---- ${username} login access accepted successfully`);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Logout (client-side token removal; this is a no-op endpoint)
app.get("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
  console.log(`Success ---- user logout successfully`);
});

// Google OAuth — redirect flow
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Issue JWT and redirect to frontend with token
    const token = signToken(req.user);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role
    }))}`);
    console.log(`Success ---- User login access accepted successfully (google auth)`);
  }
);

// ── Protected API routes ────────────────────────
app.use("/shopping-list", requireAuth, shoppingRoutes);
app.use("/reports", requireAuth, reportRoutes);
app.use("/branches", requireAuth, branchRoutes);

// ── Start server ────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Naivas API running on port ${PORT}`);
});
