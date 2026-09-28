/* ====== JavaScript ====== */

// Tab Switching
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(btn.dataset.target).classList.remove("hidden");
  });
});

// Global Data
let patients = JSON.parse(localStorage.getItem("patients")) || [];
let doctors = JSON.parse(localStorage.getItem("doctors")) || [
  { name: "Dr. Anil Kumar", spec: "Cardiologist" },
  { name: "Dr. Priya Sharma", spec: "Neurologist" },
  { name: "Dr. Ravi Reddy", spec: "Orthopedic" },
  { name: "Dr. Meera Joshi", spec: "Pediatrician" },
  { name: "Dr. Sunil Gupta", spec: "Dermatologist" }
];
let treatments = JSON.parse(localStorage.getItem("treatments")) || [];
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

// Render Patients
function renderPatients() {
  const tbody = document.querySelector("#patientTable tbody");
  tbody.innerHTML = patients.map((p, i) =>
    `<tr>
      <td>${p.name}</td>
      <td>${p.gender}</td>
      <td>${p.age}</td>
      <td>${p.phone}</td>
      <td>${currentUser==="owner" ? `<button onclick="deletePatient(${i})">❌</button>` : ""}</td>
    </tr>`).join("");
  localStorage.setItem("patients", JSON.stringify(patients));
}

// Render Doctors
function renderDoctors() {
  const tbody = document.querySelector("#doctorTable tbody");
  tbody.innerHTML = doctors.map((d,i) =>
    `<tr>
      <td>${d.name}</td>
      <td>${d.spec}</td>
      <td>${currentUser==="owner" ? `<button onclick="deleteDoctor(${i})">❌</button>` : ""}</td>
    </tr>`).join("");

  // populate appointment doctor select
  const select = document.getElementById("apptDoctor");
  select.innerHTML = `<option value="" selected hidden>Select Doctor</option>` +
    doctors.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join("");
  select.style.color = "grey";

  localStorage.setItem("doctors", JSON.stringify(doctors));
}

// Render Treatments
function renderTreatments() {
  const tbody = document.querySelector("#treatTable tbody");
  tbody.innerHTML = treatments.map((t,i) =>
    `<tr>
      <td>${t.patient}</td>
      <td>${t.name}</td>
      <td>${t.cost}</td>
      <td>${currentUser==="owner" ? `<button onclick="deleteTreatment(${i})">❌</button>` : ""}</td>
    </tr>`).join("");
  localStorage.setItem("treatments", JSON.stringify(treatments));
}

// Render Bills
function renderBills() {
  const tbody = document.querySelector("#billTable tbody");
  tbody.innerHTML = bills.map((b,i) =>
    `<tr>
      <td>${b.patient}</td>
      <td>${b.amount}</td>
      <td>${b.status}</td>
      <td>${currentUser==="owner" ? `<button onclick="markPaid(${i})">✅</button><button onclick="deleteBill(${i})">❌</button>` : ""}</td>
    </tr>`).join("");
  localStorage.setItem("bills", JSON.stringify(bills));
}

// Render Appointments
function renderAppointments() {
  const tbody = document.querySelector("#appointmentTable tbody");
  tbody.innerHTML = appointments.map((a,i) =>
    `<tr>
      <td>${a.patient}</td>
      <td>${a.gender}</td>
      <td>${a.age}</td>
      <td>${a.phone}</td>
      <td>${a.doctor}</td>
      <td>${new Date(a.date).toLocaleString()}</td>
      <td>${a.status}</td>
      <td>${currentUser==="owner" ? `<button onclick="completeAppointment(${i})">✅</button><button onclick="deleteAppointment(${i})">❌</button>` : ""}</td>
    </tr>`).join("");
  localStorage.setItem("appointments", JSON.stringify(appointments));
}

// CRUD Functions
function deletePatient(i){ patients.splice(i,1); renderPatients(); updateDashboard(); }
function deleteDoctor(i){ doctors.splice(i,1); renderDoctors(); updateDashboard(); }
function deleteTreatment(i){ treatments.splice(i,1); renderTreatments(); updateDashboard(); }
function markPaid(i){ bills[i].status="Paid"; renderBills(); updateDashboard(); }
function deleteBill(i){ bills.splice(i,1); renderBills(); updateDashboard(); }
function completeAppointment(i){ appointments[i].status="Completed"; renderAppointments(); updateDashboard(); }
function deleteAppointment(i){ appointments.splice(i,1); renderAppointments(); updateDashboard(); }

// Forms (Owner only)
if(!localStorage.getItem("role") || localStorage.getItem("role")==="owner") {
  document.getElementById("patientForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    patients.push({name:pName.value, gender:pGender.value, age:pAge.value, phone:pPhone.value});
    e.target.reset(); 
    pGender.style.color = "grey";
    renderPatients(); updateDashboard();
  });

  document.getElementById("doctorForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    doctors.push({name:dName.value, spec:dSpec.value});
    e.target.reset(); renderDoctors(); updateDashboard();
  });

  document.getElementById("treatForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    const patient = tpName.value;
    const name = tName.value;
    const cost = tCost.value;
    treatments.push({patient,name,cost}); renderTreatments();
    bills.push({patient,amount:cost,status:"Unpaid"}); renderBills();
    e.target.reset(); updateDashboard();
  });

  document.getElementById("billForm")?.addEventListener("submit", e=>{
    e.preventDefault();
    bills.push({patient:bPatient.value, amount:bAmount.value, status:"Unpaid"}); 
    e.target.reset(); renderBills(); updateDashboard();
  });
}

// Appointment Form
const apptDoctorSelect = document.getElementById("apptDoctor");
const apptGenderSelect = document.getElementById("apptGender");

[apptDoctorSelect, apptGenderSelect].forEach(select => {
  select.style.color = "grey"; // initial placeholder color
  select.addEventListener("change", function(){
    if(this.value === "") this.style.color = "grey";
    else this.style.color = "white";
  });
});

document.getElementById('appointmentForm')?.addEventListener('submit', function(e){
  e.preventDefault();
  const patient = apptPatient.value.trim();
  const gender = apptGender.value.trim();
  const age = apptAge.value.trim();
  const phone = apptPhone.value.trim();
  const doctor = apptDoctor.value.trim();
  const date = apptDate.value;

  // Save appointment
  appointments.push({patient, gender, age, phone, doctor, date, status:"Scheduled"});
  renderAppointments();

  // Add/update patient
  const existingIndex = patients.findIndex(p=>p.name===patient && p.phone===phone);
  if(existingIndex === -1){
    patients.push({name:patient, gender, age, phone});
  } else {
    patients[existingIndex] = {name:patient, gender, age, phone};
  }
  renderPatients();

  // Reset form
  apptPatient.value = "";
  apptGender.value = "";
  apptGender.style.color = "grey";
  apptAge.value = "";
  apptPhone.value = "";
  apptDoctor.value = "";
  apptDoctor.style.color = "grey";
  apptDate.value = "";

  updateDashboard();
});

// Dashboard Update
function updateDashboard() {
  if(!document.getElementById("statPatients")) return;
  document.getElementById("statPatients").textContent = patients.length;
  document.getElementById("statDoctors").textContent = doctors.length;
  document.getElementById("statTreatments").textContent = treatments.length;
  document.getElementById("statBills").textContent = bills.length;
  document.getElementById("statUnpaid").textContent = bills.filter(b=>b.status==="Unpaid").length;

  const now = new Date();
  const upcoming = appointments.filter(a=>new Date(a.date)>=now && a.status==="Scheduled").length;
  document.getElementById("statAppointments").textContent = upcoming;
}
setInterval(updateDashboard,1000);

// Login & Role Handling
let currentUser = localStorage.getItem("role") || null;

function setActiveTab(targetId) {
  document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(targetId).classList.remove("hidden");
  document.querySelector(`[data-target="${targetId}"]`)?.classList.add("active");
}

function showApp(){
  login.classList.add("hidden");
  logoutBtn.style.display="inline-block";
  navbar.style.display="inline-block";

  if(currentUser==="owner"){
    document.querySelector("[data-target='dashboard']").style.display="inline-block";
    document.querySelector("[data-target='treatments']").style.display="inline-block";
    document.querySelector("[data-target='billing']").style.display="inline-block";
    setActiveTab("dashboard");
  } else if(currentUser==="staff"){
    document.querySelector("[data-target='dashboard']").style.display="none";
    document.querySelector("[data-target='treatments']").style.display="none";
    document.querySelector("[data-target='billing']").style.display="none";
    setActiveTab("patients");
  }

  renderPatients(); renderDoctors(); renderTreatments(); renderBills(); renderAppointments();
  updateDashboard();
}

if(currentUser) showApp();

if(currentUser === "owner") document.getElementById("doctorForm").style.display = "block";
else if(currentUser === "staff") document.getElementById("doctorForm").style.display = "none";

document.getElementById("loginForm")?.addEventListener("submit", e=>{
  e.preventDefault();
  const user=username.value.trim();
  const pass=password.value.trim();
  if(user==="owner" && pass==="admin123") currentUser="owner";
  else if(user==="staff" && pass==="staff123") currentUser="staff";
  else { alert("Invalid credentials!"); return; }

  localStorage.setItem("role", currentUser);
  showApp();
});

document.getElementById("logoutBtn")?.addEventListener("click", ()=>{
  localStorage.removeItem("role");
  location.reload();
});
