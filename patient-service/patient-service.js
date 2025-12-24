const express = require("express");
const app = express();

// ✅ STANDARDIZED PORT
const PORT = process.env.PORT || 3000;

// Appointment service internal URL
const APPOINTMENT_SERVICE_URL =
  process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:8081";

app.use(express.json());

// In-memory data store
let patients = [
  { id: "1", name: "John Doe", age: 30, condition: "Healthy" },
  { id: "2", name: "Jane Smith", age: 45, condition: "Hypertension" }
];

// =======================
// ORIGINAL ROUTES (KEEP)
// =======================

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Patient Service"
  });
});

// Get all patients
app.get("/patients", (req, res) => {
  res.json({
    message: "Patients retrieved successfully",
    count: patients.length,
    patients
  });
});

// Get patient by ID
app.get("/patients/:id", (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);

  if (patient) {
    res.json({
      message: "Patient found",
      patient
    });
  } else {
    res.status(404).json({ error: "Patient not found" });
  }
});

// Create new patient
app.post("/patients", (req, res) => {
  try {
    const { name, age, condition } = req.body;

    if (!name || !age) {
      return res.status(400).json({
        error: "Name and age are required"
      });
    }

    const newPatient = {
      id: (patients.length + 1).toString(),
      name,
      age,
      condition: condition || "Not specified"
    };

    patients.push(newPatient);

    res.status(201).json({
      message: "Patient added successfully",
      patient: newPatient
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

// =======================
// 🔥 ALB PREFIX ROUTES
// =======================

// ALB → /patient/health
app.get("/patient/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Patient Service"
  });
});

// ALB → /patient/patients
app.get("/patient/patients", (req, res) => {
  res.json({
    message: "Patients retrieved successfully",
    count: patients.length,
    patients
  });
});

// ALB → /patient/patients/:id
app.get("/patient/patients/:id", (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);

  if (patient) {
    res.json({
      message: "Patient found",
      patient
    });
  } else {
    res.status(404).json({ error: "Patient not found" });
  }
});

// =======================
// Patient → Appointment health (internal)
// =======================

app.get("/patient/appointments/health", async (req, res) => {
  try {
    const response = await fetch(`${APPOINTMENT_SERVICE_URL}/health`);
    const data = await response.json();

    res.json({
      patientService: "OK",
      appointmentService: data
    });
  } catch (error) {
    res.status(500).json({
      error: "Unable to reach Appointment Service",
      details: error.message
    });
  }
});

// =======================
// START SERVER
// =======================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Patient service listening at http://0.0.0.0:${PORT}`);
});
