 // setup
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// server connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Darkwaters@332006',
  database: 'airline_data'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// submit
app.post('/submit', (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO ticket_info (
      gst, bill, issue_date, sap_client, client_code,
      booked_by, requested_by, airline, passenger,
      ticket_no, flight_no, travel_date, sectors,
      travel_class, gross_fare
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    data.gst, data.bill, data.issue_date, data.sap_client, data.client_code,
    data.booked_by, data.requested_by, data.airline, data.passenger,
    data.ticket_no, data.flight_no, data.travel_date, data.sectors,
    data.travel_class, data.gross_fare
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return result.status(400).send('Ticket with this Bill Number already exists.');
      }
      console.error('Insert error:', err);
      return result.status(500).send('Database error');
    }
    result.send('Form submitted successfully to database!');
  });
});

// update
app.put('/update', (req, res) => {
  const data = req.body;

  if (!data.bill) {
    return res.status(400).send("Bill Number is required.");
  }

  const sql = `
    UPDATE ticket_info SET
      gst = ?, issue_date = ?, sap_client = ?, client_code = ?,
      booked_by = ?, requested_by = ?, airline = ?, passenger = ?,
      ticket_no = ?, flight_no = ?, travel_date = ?, sectors = ?,
      travel_class = ?, gross_fare = ?
    WHERE bill = ?
  `;

  const values = [
    data.gst, data.issue_date, data.sap_client, data.client_code,
    data.booked_by, data.requested_by, data.airline, data.passenger,
    data.ticket_no, data.flight_no, data.travel_date, data.sectors,
    data.travel_class, data.gross_fare, data.bill
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return result.status(500).send("Database update failed.");
    }
    if (result.affectedRows === 0) {
      return result.status(404).send("No ticket found with this Bill Number.");
    }
    result.send("Ticket updated successfully.");
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


//request-emp code
app.post('/check-code', (req, res) => {
  const code = parseInt(req.body.code, 10);

  if (isNaN(code)) {
    return res.status(400).json({ message: "Invalid code" });
  }

  const sql = "SELECT * FROM employees WHERE code = ?";
  db.query(sql, [code], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.json({ message: "Code exists", data: results[0] });
    } else {
      return res.status(404).json({ message: "Not found" });
    }
  });
}); 
