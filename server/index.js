const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Render Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("Database Connection Failed!", err.stack);
  } else {
    console.log("PostgreSQL Database Connected Successfully!");
    release();
  }
});

app.post("/api/orders", async (req, res) => {
  const { name, phone, address, payment, total } = req.body;
  const query = "INSERT INTO orders (customer_name, phone, address, payment_method, total_amount) VALUES (\$1, \$2, \$3, \$4, \$5) RETURNING id";
  
  try {
    const result = await pool.query(query, [name, phone, address, payment, total]);
    res.json({ message: "Order saved in Database successfully!", orderId: result.rows[0].id });
  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).json({ error: "Failed to store order" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));