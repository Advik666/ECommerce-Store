import { useState, useEffect, createContext, useContext, useReducer } from "react";

// ─── DATA LAYER (simulates backend/database) ────────────────────────────────

const PRODUCTS_DB = [
  { id: 1, name: "Wireless Noise-Cancelling Headphones", price: 2499, category: "Electronics", image: "🎧", stock: 12, rating: 4.7, reviews: 234, description: "Premium audio with 30hr battery life, active noise cancellation, and foldable design. Compatible with all Bluetooth devices." },
  { id: 2, name: "Mechanical Gaming Keyboard", price: 3999, category: "Electronics", image: "⌨️", stock: 8, rating: 4.5, reviews: 189, description: "RGB backlit mechanical keyboard with tactile switches. Anti-ghosting, detachable USB-C cable, and aluminium body." },
  { id: 3, name: "Smart Fitness Watch", price: 5999, category: "Wearables", image: "⌚", stock: 15, rating: 4.8, reviews: 412, description: "Track health metrics, GPS, sleep analysis, and notifications. 7-day battery, IP68 water resistant." },
  { id: 4, name: "4K Webcam Pro", price: 4499, category: "Electronics", image: "📷", stock: 6, rating: 4.3, reviews: 97, description: "Ultra-clear 4K streaming webcam with autofocus, built-in stereo microphone, and HDR support for professional calls." },
  { id: 5, name: "Ergonomic Office Chair", price: 12999, category: "Furniture", image: "🪑", stock: 4, rating: 4.6, reviews: 156, description: "Lumbar support, adjustable armrests, breathable mesh back, and 360° swivel. Supports up to 150kg." },
  { id: 6, name: "Portable Bluetooth Speaker", price: 1799, category: "Electronics", image: "🔊", stock: 20, rating: 4.4, reviews: 321, description: "360° surround sound, IPX7 waterproof, 24hr playtime, and built-in power bank for charging your devices." },
  { id: 7, name: "Laptop Stand Aluminium", price: 1299, category: "Accessories", image: "💻", stock: 18, rating: 4.2, reviews: 88, description: "Foldable aluminium stand with adjustable height. Compatible with MacBook, Surface, and all laptops up to 17 inches." },
  { id: 8, name: "USB-C Hub 7-in-1", price: 1999, category: "Accessories", image: "🔌", stock: 25, rating: 4.5, reviews: 207, description: "7-in-1 hub: 4K HDMI, 3× USB-A, SD/MicroSD card reader, USB-C PD 100W passthrough charging." },
  { id: 9, name: "LED Desk Lamp", price: 899, category: "Furniture", image: "💡", stock: 30, rating: 4.1, reviews: 143, description: "Touch-controlled LED lamp, 5 brightness levels, USB charging port, flexible arm, and eye-care mode." },
  { id: 10, name: "Wireless Mouse Silent", price: 999, category: "Accessories", image: "🖱️", stock: 22, rating: 4.3, reviews: 176, description: "Silent click wireless mouse, 2.4GHz, 12-month battery, ergonomic design, and DPI up to 1600." },
  { id: 11, name: "Smart Home Hub", price: 3499, category: "Electronics", image: "🏠", stock: 7, rating: 4.6, reviews: 92, description: "Control all your smart home devices in one place. Works with Alexa, Google Home, and 5000+ integrations." },
  { id: 12, name: "Noise-Cancelling Earbuds", price: 1599, category: "Wearables", image: "🎵", stock: 16, rating: 4.7, reviews: 388, description: "True wireless earbuds with ANC, 8hr battery + 24hr case, IPX5 rating, and transparent mode." },
];

const USERS_DB_KEY = "eshop_users";
const ORDERS_DB_KEY = "eshop_orders";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_DB_KEY) || "[]");
const saveUsers = (u) => localStorage.setItem(USERS_DB_KEY, JSON.stringify(u));
const getOrders = () => JSON.parse(localStorage.getItem(ORDERS_DB_KEY) || "[]");
const saveOrders = (o) => localStorage.setItem(ORDERS_DB_KEY, JSON.stringify(o));

// ─── CONTEXTS ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);
const CartContext = createContext(null);
const ToastContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find(i => i.id === action.product.id);
      if (exists) return state.map(i => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.product, qty: 1 }];
    }
    case "REMOVE": return state.filter(i => i.id !== action.id);
    case "UPDATE_QTY": return state.map(i => i.id === action.id ? { ...i, qty: action.qty } : i).filter(i => i.qty > 0);
    case "CLEAR": return [];
    default: return state;
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const S = {
  // Layout
  app: { fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#f8f7f4", color: "#1a1a1a" },
  nav: { background: "#1a1a2e", color: "#fff", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  navLogo: { fontSize: 22, fontWeight: 700, color: "#e94560", letterSpacing: "-0.5px", cursor: "pointer" },
  navLinks: { display: "flex", gap: 8, alignItems: "center" },
  navBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", padding: "6px 12px", borderRadius: 6, fontSize: 14, transition: "all 0.2s" },
  navBtnActive: { background: "#e94560", color: "#fff", border: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 6, fontSize: 14 },
  cartBtn: { background: "#e94560", border: "none", color: "#fff", cursor: "pointer", padding: "6px 14px", borderRadius: 20, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 },
  main: { maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" },

  // Cards
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" },
  productCard: { background: "#fff", borderRadius: 14, padding: "1.25rem", cursor: "pointer", transition: "all 0.2s", border: "1px solid #eee" },
  productEmoji: { fontSize: 56, textAlign: "center", marginBottom: 12, lineHeight: 1 },
  productName: { fontSize: 15, fontWeight: 600, marginBottom: 6, color: "#1a1a1a", lineHeight: 1.4 },
  productPrice: { fontSize: 20, fontWeight: 700, color: "#e94560", marginBottom: 8 },
  productCategory: { fontSize: 12, background: "#f0f0ff", color: "#6366f1", padding: "3px 10px", borderRadius: 20, display: "inline-block", marginBottom: 10 },
  stars: { fontSize: 13, color: "#f59e0b", marginBottom: 10 },

  // Buttons
  btnPrimary: { background: "#e94560", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, width: "100%", transition: "all 0.2s" },
  btnSecondary: { background: "#f0f0ff", color: "#6366f1", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" },
  btnOutline: { background: "none", color: "#e94560", border: "2px solid #e94560", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" },

  // Forms
  formCard: { background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 420, margin: "3rem auto", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  formTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" },
  formSub: { fontSize: 14, color: "#666", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: 600, color: "#444", display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e0e0e0", fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 16, transition: "border 0.2s" },
  error: { color: "#e94560", fontSize: 13, marginBottom: 12 },

  // Tags & Badges
  badge: (c) => ({ background: c || "#e94560", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 700 }),
  tag: { background: "#f8f7f4", color: "#666", borderRadius: 6, padding: "4px 10px", fontSize: 12, display: "inline-block" },

  // Cart
  cartItem: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f0f0f0" },
  qtyBtn: { background: "#f0f0ff", border: "none", color: "#6366f1", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },

  // Section headers
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  sectionTitle: { fontSize: 26, fontWeight: 700, color: "#1a1a2e" },

  // Filters
  filterBar: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" },
  filterChip: (active) => ({ background: active ? "#e94560" : "#fff", color: active ? "#fff" : "#666", border: `1.5px solid ${active ? "#e94560" : "#ddd"}`, padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s" }),

  // Toast
  toast: { position: "fixed", bottom: 24, right: 24, background: "#1a1a2e", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" },

  // Hero
  hero: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", color: "#fff", borderRadius: 18, padding: "3rem 2.5rem", marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  heroTitle: { fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 },
  heroSub: { fontSize: 16, color: "#aaa", maxWidth: 420, marginBottom: 24 },

  // Order
  orderCard: { background: "#fff", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1rem", border: "1px solid #eee" },
  statusBadge: (s) => ({ background: s === "Delivered" ? "#d1fae5" : s === "Cancelled" ? "#fee2e2" : "#fef3c7", color: s === "Delivered" ? "#065f46" : s === "Cancelled" ? "#991b1b" : "#92400e", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }),

  // Detail page
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" },
  detailImage: { background: "#f8f7f4", borderRadius: 18, padding: "3rem", textAlign: "center", fontSize: 96 },

  // Empty state
  emptyState: { textAlign: "center", padding: "4rem 2rem", color: "#888" },
};

// ─── TOAST ───────────────────────────────────────────────────────────────────

function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const show = (m, icon = "✅") => {
    setMsg({ m, icon });
    setTimeout(() => setMsg(null), 2500);
  };
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg && (
        <div style={S.toast}>
          <span>{msg.icon}</span>
          <span>{msg.m}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ─── AUTH PROVIDER ───────────────────────────────────────────────────────────

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("eshop_session")); } catch { return null; }
  });

  const login = (email, password) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return "Invalid email or password.";
    sessionStorage.setItem("eshop_session", JSON.stringify(found));
    setUser(found);
    return null;
  };

  const register = (name, email, password) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) return "Email already registered.";
    const newUser = { id: Date.now(), name, email, password, createdAt: new Date().toISOString() };
    saveUsers([...users, newUser]);
    sessionStorage.setItem("eshop_session", JSON.stringify(newUser));
    setUser(newUser);
    return null;
  };

  const logout = () => { sessionStorage.removeItem("eshop_session"); setUser(null); };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

// ─── CART PROVIDER ───────────────────────────────────────────────────────────

function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return <CartContext.Provider value={{ items, dispatch, total, count }}>{children}</CartContext.Provider>;
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar({ page, setPage }) {
  const { user, logout } = useContext(AuthContext);
  const { count } = useContext(CartContext);
  return (
    <nav style={S.nav}>
      <div style={S.navLogo} onClick={() => setPage("home")}>⚡ ShopZen</div>
      <div style={S.navLinks}>
        <button style={S.navBtn} onClick={() => setPage("home")}>🏠 Home</button>
        <button style={S.navBtn} onClick={() => setPage("products")}>📦 Products</button>
        {user && <button style={S.navBtn} onClick={() => setPage("orders")}>📋 Orders</button>}
        {user ? (
          <>
            <span style={{ color: "#aaa", fontSize: 13 }}>Hi, {user.name.split(" ")[0]}</span>
            <button style={S.navBtn} onClick={() => { logout(); setPage("home"); }}>Logout</button>
          </>
        ) : (
          <>
            <button style={S.navBtn} onClick={() => setPage("login")}>Login</button>
            <button style={{ ...S.navBtnActive }} onClick={() => setPage("register")}>Sign Up</button>
          </>
        )}
        <button style={S.cartBtn} onClick={() => setPage("cart")}>
          🛒 Cart {count > 0 && <span style={S.badge()}>{count}</span>}
        </button>
      </div>
    </nav>
  );
}

// ─── STAR RATING ─────────────────────────────────────────────────────────────

function Stars({ rating, reviews }) {
  return (
    <div style={S.stars}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span style={{ color: "#999", marginLeft: 6 }}>{rating} ({reviews})</span>
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────

function HomePage({ setPage, setSelectedProduct }) {
  const { dispatch } = useContext(CartContext);
  const toast = useContext(ToastContext);
  const featured = PRODUCTS_DB.slice(0, 4);

  return (
    <div>
      <div style={S.hero}>
        <div>
          <div style={S.heroTitle}>Premium Tech,<br />Unbeatable Prices</div>
          <div style={S.heroSub}>Discover curated electronics, accessories, and smart home devices — delivered fast.</div>
          <button style={{ ...S.btnPrimary, width: "auto", padding: "12px 32px", fontSize: 16 }} onClick={() => setPage("products")}>
            Shop Now →
          </button>
        </div>
        <div style={{ fontSize: 100 }}>🛍️</div>
      </div>

      <div style={S.sectionHeader}>
        <div style={S.sectionTitle}>Featured Products</div>
        <button style={S.btnSecondary} onClick={() => setPage("products")}>View All →</button>
      </div>

      <div style={S.productGrid}>
        {featured.map(p => (
          <div key={p.id} style={S.productCard}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}>
            <div style={S.productEmoji}>{p.image}</div>
            <span style={S.productCategory}>{p.category}</span>
            <div style={S.productName}>{p.name}</div>
            <Stars rating={p.rating} reviews={p.reviews} />
            <div style={S.productPrice}>₹{p.price.toLocaleString()}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btnPrimary, flex: 1 }} onClick={() => { dispatch({ type: "ADD", product: p }); toast(`${p.name.split(" ")[0]} added!`); }}>
                Add to Cart
              </button>
              <button style={{ ...S.btnOutline, flex: "none" }} onClick={() => { setSelectedProduct(p); setPage("detail"); }}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", margin: "3rem 0 0" }}>
        {[["🚚", "Free Shipping", "On orders above ₹999"], ["🔒", "Secure Payments", "256-bit SSL encryption"], ["↩️", "Easy Returns", "30-day hassle-free returns"]].map(([icon, t, s]) => (
          <div key={t} style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", textAlign: "center", border: "1px solid #eee" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────

function ProductsPage({ setPage, setSelectedProduct }) {
  const { dispatch } = useContext(CartContext);
  const toast = useContext(ToastContext);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const categories = ["All", ...new Set(PRODUCTS_DB.map(p => p.category))];
  let filtered = PRODUCTS_DB.filter(p =>
    (cat === "All" || p.category === cat) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div>
      <div style={S.sectionHeader}>
        <div style={S.sectionTitle}>All Products</div>
        <span style={{ color: "#888", fontSize: 14 }}>{filtered.length} items</span>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...S.input, width: 260, marginBottom: 0, flex: "none" }}
        />
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ ...S.input, width: 180, marginBottom: 0, flex: "none" }}>
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div style={S.filterBar}>
        {categories.map(c => (
          <button key={c} style={S.filterChip(cat === c)} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={S.emptyState}><div style={{ fontSize: 48 }}>🔍</div><div>No products found</div></div>
      ) : (
        <div style={S.productGrid}>
          {filtered.map(p => (
            <div key={p.id} style={S.productCard}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <div style={S.productEmoji}>{p.image}</div>
              <span style={S.productCategory}>{p.category}</span>
              <div style={S.productName}>{p.name}</div>
              <Stars rating={p.rating} reviews={p.reviews} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={S.productPrice}>₹{p.price.toLocaleString()}</div>
                <span style={{ fontSize: 12, color: p.stock < 5 ? "#e94560" : "#22c55e" }}>
                  {p.stock < 5 ? `Only ${p.stock} left!` : "In Stock"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btnPrimary, flex: 1 }} onClick={() => { dispatch({ type: "ADD", product: p }); toast(`${p.name.split(" ")[0]} added to cart!`); }}>
                  Add to Cart
                </button>
                <button style={{ ...S.btnOutline, flex: "none", padding: "10px 14px" }} onClick={() => { setSelectedProduct(p); setPage("detail"); }}>
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT DETAIL PAGE ──────────────────────────────────────────────────────

function ProductDetailPage({ product, setPage }) {
  const { dispatch } = useContext(CartContext);
  const toast = useContext(ToastContext);
  const [qty, setQty] = useState(1);

  if (!product) return <div style={S.emptyState}><div>Product not found.</div><button style={S.btnPrimary} onClick={() => setPage("products")}>Back</button></div>;

  const related = PRODUCTS_DB.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div>
      <button style={{ ...S.btnSecondary, marginBottom: 24 }} onClick={() => setPage("products")}>← Back to Products</button>

      <div style={S.detailGrid}>
        <div>
          <div style={S.detailImage}>{product.image}</div>
        </div>
        <div>
          <span style={S.productCategory}>{product.category}</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "10px 0 8px", color: "#1a1a2e", lineHeight: 1.3 }}>{product.name}</h1>
          <Stars rating={product.rating} reviews={product.reviews} />
          <div style={{ fontSize: 32, fontWeight: 800, color: "#e94560", margin: "10px 0 16px" }}>₹{product.price.toLocaleString()}</div>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Quantity:</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={S.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span style={{ fontWeight: 700, width: 24, textAlign: "center" }}>{qty}</span>
              <button style={S.qtyBtn} onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <span style={{ fontSize: 13, color: product.stock < 5 ? "#e94560" : "#22c55e" }}>
              {product.stock < 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
            </span>
          </div>

          <button style={{ ...S.btnPrimary, marginBottom: 10 }} onClick={() => {
            for (let i = 0; i < qty; i++) dispatch({ type: "ADD", product });
            toast(`${qty}× ${product.name.split(" ")[0]} added!`);
          }}>
            🛒 Add {qty > 1 ? `${qty} items` : ""} to Cart — ₹{(product.price * qty).toLocaleString()}
          </button>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            {["Free Shipping", "Easy Returns", "Warranty Included"].map(t => (
              <span key={t} style={{ ...S.tag, color: "#6366f1", background: "#f0f0ff" }}>✓ {t}</span>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <div style={{ ...S.sectionTitle, marginBottom: "1.5rem" }}>You May Also Like</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {related.map(p => (
              <div key={p.id} style={{ ...S.productCard, cursor: "pointer" }}
                onClick={() => { setPage("detail"); window.scrollTo(0, 0); }}>
                <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>{p.image}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: "#e94560", fontWeight: 700 }}>₹{p.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────

function CartPage({ setPage }) {
  const { items, dispatch, total } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const toast = useContext(ToastContext);

  if (items.length === 0) return (
    <div style={S.emptyState}>
      <div style={{ fontSize: 64 }}>🛒</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</div>
      <div style={{ color: "#888", marginBottom: 24 }}>Add some products to get started</div>
      <button style={{ ...S.btnPrimary, width: "auto", padding: "12px 28px" }} onClick={() => setPage("products")}>Browse Products</button>
    </div>
  );

  const shipping = total >= 999 ? 0 : 99;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={S.sectionTitle}>Shopping Cart ({items.reduce((s, i) => s + i.qty, 0)} items)</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", marginTop: "1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #eee" }}>
          {items.map(item => (
            <div key={item.id} style={S.cartItem}>
              <div style={{ fontSize: 40 }}>{item.image}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                <div style={{ color: "#e94560", fontWeight: 700 }}>₹{item.price.toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button style={S.qtyBtn} onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty - 1 })}>−</button>
                <span style={{ fontWeight: 700, width: 20, textAlign: "center" }}>{item.qty}</span>
                <button style={S.qtyBtn} onClick={() => dispatch({ type: "UPDATE_QTY", id: item.id, qty: item.qty + 1 })}>+</button>
              </div>
              <div style={{ fontWeight: 700, minWidth: 80, textAlign: "right" }}>₹{(item.price * item.qty).toLocaleString()}</div>
              <button onClick={() => { dispatch({ type: "REMOVE", id: item.id }); toast("Item removed", "🗑️"); }}
                style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
            </div>
          ))}
        </div>

        <div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #eee", marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Order Summary</div>
            {[["Subtotal", `₹${total.toLocaleString()}`], ["Shipping", shipping === 0 ? "Free 🎉" : `₹${shipping}`], ["Tax (18% GST)", `₹${Math.round(total * 0.18).toLocaleString()}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: "#666" }}>{k}</span>
                <span style={{ fontWeight: 600, color: k === "Shipping" && shipping === 0 ? "#22c55e" : "#1a1a1a" }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
              <span>Total</span>
              <span style={{ color: "#e94560" }}>₹{(total + shipping + Math.round(total * 0.18)).toLocaleString()}</span>
            </div>
          </div>

          {total < 999 && (
            <div style={{ background: "#fef3c7", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#92400e", marginBottom: 12 }}>
              Add ₹{(999 - total).toLocaleString()} more for free shipping!
            </div>
          )}

          <button style={S.btnPrimary} onClick={() => user ? setPage("checkout") : setPage("login")}>
            {user ? "Proceed to Checkout →" : "Login to Checkout →"}
          </button>
          <button style={{ ...S.btnSecondary, width: "100%", marginTop: 10 }} onClick={() => setPage("products")}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────

function CheckoutPage({ setPage }) {
  const { items, dispatch, total } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const toast = useContext(ToastContext);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", address: "", city: "", pincode: "", phone: "" });
  const [payment, setPayment] = useState("card");
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping + Math.round(total * 0.18);

  const placeOrder = () => {
    if (!form.address || !form.city || !form.pincode || !form.phone) { toast("Please fill all fields", "⚠️"); return; }
    const order = {
      id: `ORD${Date.now()}`,
      userId: user.id,
      items: items.map(i => ({ ...i })),
      total: grandTotal,
      address: form,
      payment,
      status: "Processing",
      createdAt: new Date().toISOString(),
    };
    const orders = getOrders();
    saveOrders([...orders, order]);
    setOrderId(order.id);
    dispatch({ type: "CLEAR" });
    setOrdered(true);
    toast("Order placed successfully!", "🎉");
  };

  if (ordered) return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", marginBottom: 8 }}>Order Placed!</div>
      <div style={{ color: "#666", marginBottom: 8 }}>Order ID: <strong style={{ color: "#6366f1" }}>{orderId}</strong></div>
      <div style={{ color: "#666", marginBottom: 32 }}>You'll receive a confirmation email shortly.</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button style={{ ...S.btnPrimary, width: "auto", padding: "12px 28px" }} onClick={() => setPage("orders")}>View Orders</button>
        <button style={{ ...S.btnSecondary, padding: "12px 28px" }} onClick={() => setPage("home")}>Continue Shopping</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={S.sectionTitle}>Checkout</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", marginTop: "1.5rem" }}>
        <div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #eee", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📦 Delivery Address</div>
            {[["Full Name", "name", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"], ["Address", "address", "text"], ["City", "city", "text"], ["PIN Code", "pincode", "text"]].map(([label, key, type]) => (
              <div key={key}>
                <label style={S.label}>{label}</label>
                <input type={type} placeholder={label} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })} style={S.input} />
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #eee" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>💳 Payment Method</div>
            {[["card", "💳 Credit / Debit Card"], ["upi", "📱 UPI (GPay, PhonePe, Paytm)"], ["cod", "💵 Cash on Delivery"]].map(([val, label]) => (
              <label key={val} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer" }}>
                <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} />
                <span>{label}</span>
              </label>
            ))}
            {payment === "card" && (
              <div style={{ background: "#f8f7f4", borderRadius: 10, padding: "1rem", marginTop: 10 }}>
                {[["Card Number", "1234 5678 9012 3456"], ["Name on Card", "John Doe"], ["Expiry / CVV", "MM/YY  •  CVV"]].map(([l, ph]) => (
                  <input key={l} placeholder={ph} style={{ ...S.input, fontSize: 13 }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", border: "1px solid #eee", position: "sticky", top: 80 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Order Items ({items.length})</div>
            {items.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, color: "#555" }}>
                <span>{i.image} {i.name.slice(0, 22)}… ×{i.qty}</span>
                <span style={{ fontWeight: 600 }}>₹{(i.price * i.qty).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, marginTop: 8 }}>
              {[["Subtotal", `₹${total.toLocaleString()}`], ["Shipping", shipping === 0 ? "Free" : `₹${shipping}`], ["GST (18%)", `₹${Math.round(total * 0.18).toLocaleString()}`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "#666" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, marginTop: 8 }}>
                <span>Total</span><span style={{ color: "#e94560" }}>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button style={{ ...S.btnPrimary, marginTop: 16 }} onClick={placeOrder}>Place Order 🎉</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDERS PAGE ──────────────────────────────────────────────────────────────

function OrdersPage({ setPage }) {
  const { user } = useContext(AuthContext);
  const orders = getOrders().filter(o => o.userId === user?.id).reverse();

  if (orders.length === 0) return (
    <div style={S.emptyState}>
      <div style={{ fontSize: 64 }}>📋</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No orders yet</div>
      <div style={{ color: "#888", marginBottom: 24 }}>Your past orders will appear here</div>
      <button style={{ ...S.btnPrimary, width: "auto", padding: "12px 28px" }} onClick={() => setPage("products")}>Start Shopping</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={S.sectionTitle}>My Orders ({orders.length})</div>
      <div style={{ marginTop: "1.5rem" }}>
        {orders.map(order => (
          <div key={order.id} style={S.orderCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#6366f1" }}>{order.id}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <span style={S.statusBadge(order.status)}>{order.status}</span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {order.items.map(item => (
                <span key={item.id} style={{ ...S.tag, fontSize: 13 }}>{item.image} {item.name.split(" ")[0]} ×{item.qty}</span>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
              <div style={{ fontSize: 13, color: "#666" }}>
                📍 {order.address.city} • 💳 {order.payment.toUpperCase()}
              </div>
              <div style={{ fontWeight: 800, color: "#e94560", fontSize: 16 }}>₹{order.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

function LoginPage({ setPage }) {
  const { login } = useContext(AuthContext);
  const toast = useContext(ToastContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    const error = login(form.email, form.password);
    if (error) { setErr(error); return; }
    toast("Welcome back! 👋");
    setPage("home");
  };

  return (
    <div style={S.formCard}>
      <div style={S.formTitle}>Welcome back 👋</div>
      <div style={S.formSub}>Sign in to your ShopZen account</div>
      {err && <div style={S.error}>⚠️ {err}</div>}
      <label style={S.label}>Email Address</label>
      <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={S.input} />
      <label style={S.label}>Password</label>
      <input type="password" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
        style={S.input} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      <button style={S.btnPrimary} onClick={handleSubmit}>Sign In →</button>
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#666" }}>
        Don't have an account?{" "}
        <span style={{ color: "#e94560", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("register")}>Register here</span>
      </div>
      <div style={{ background: "#f0f0ff", borderRadius: 10, padding: "10px 14px", marginTop: 16, fontSize: 13, color: "#6366f1" }}>
        💡 <strong>Demo:</strong> Register a new account to try all features!
      </div>
    </div>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────

function RegisterPage({ setPage }) {
  const { register } = useContext(AuthContext);
  const toast = useContext(ToastContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) { setErr("All fields are required."); return; }
    if (form.password !== form.confirm) { setErr("Passwords do not match."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    const error = register(form.name, form.email, form.password);
    if (error) { setErr(error); return; }
    toast("Account created! Welcome 🎉");
    setPage("home");
  };

  return (
    <div style={S.formCard}>
      <div style={S.formTitle}>Create Account</div>
      <div style={S.formSub}>Join thousands of shoppers on ShopZen</div>
      {err && <div style={S.error}>⚠️ {err}</div>}
      {[["Full Name", "name", "text", "John Doe"], ["Email Address", "email", "email", "you@example.com"], ["Password", "password", "password", "Min. 6 characters"], ["Confirm Password", "confirm", "password", "Repeat password"]].map(([label, key, type, ph]) => (
        <div key={key}>
          <label style={S.label}>{label}</label>
          <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={S.input} />
        </div>
      ))}
      <button style={S.btnPrimary} onClick={handleSubmit}>Create Account →</button>
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#666" }}>
        Already have an account?{" "}
        <span style={{ color: "#e94560", cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("login")}>Sign in</span>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const renderPage = (user) => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "products": return <ProductsPage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "detail": return <ProductDetailPage product={selectedProduct} setPage={setPage} />;
      case "cart": return <CartPage setPage={setPage} />;
      case "checkout": return user ? <CheckoutPage setPage={setPage} /> : <LoginPage setPage={setPage} />;
      case "orders": return user ? <OrdersPage setPage={setPage} /> : <LoginPage setPage={setPage} />;
      case "login": return <LoginPage setPage={setPage} />;
      case "register": return <RegisterPage setPage={setPage} />;
      default: return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppInner page={page} setPage={setPage} renderPage={renderPage} />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function AppInner({ page, setPage, renderPage }) {
  const { user } = useContext(AuthContext);
  return (
    <div style={S.app}>
      <Navbar page={page} setPage={setPage} />
      <div style={S.main}>{renderPage(user)}</div>
    </div>
  );
}
