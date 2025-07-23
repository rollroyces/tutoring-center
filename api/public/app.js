// Tutoring Center Manager
// =======================
// Complete app with localStorage persistence, import/export, attendance, and reports

const store = {
  students: [],
  teachers: [],
  courses: [],
  payments: [],
  sessions: [],
  expenses: [],

  // Load from localStorage or bootstrap sample data
  load() {
    const raw = localStorage.getItem('tutoringCenterData');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        ['students','teachers','courses','payments','sessions','expenses']
          .forEach(k => { store[k] = Array.isArray(data[k]) ? data[k] : []; });
        console.log('✅ Data loaded from localStorage');
      } catch {
        bootstrapSampleData();
        this.save();
      }
    } else {
      bootstrapSampleData();
      this.save();
    }
  },

  // Save to localStorage
  save() {
    localStorage.setItem(
      'tutoringCenterData',
      JSON.stringify({
        students:this.students,
        teachers:this.teachers,
        courses:this.courses,
        payments:this.payments,
        sessions:this.sessions,
        expenses:this.expenses,
        lastSaved: new Date().toISOString()
      })
    );
    console.log('💾 Data saved to localStorage');
  },

  // Export JSON backup
  export() {
    const blob = new Blob([JSON.stringify({
      students:this.students,
      teachers:this.teachers,
      courses:this.courses,
      payments:this.payments,
      sessions:this.sessions,
      expenses:this.expenses,
      exportDate: new Date().toISOString()
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutoring-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  // Import from JSON file
  import(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const d = JSON.parse(e.target.result);
        ['students','teachers','courses','payments','sessions','expenses']
          .forEach(k => { if (Array.isArray(d[k])) store[k] = d[k]; });
        store.save();
        switchView('dashboard');
        alert('✅ Data imported successfully');
      } catch {
        alert('❌ Invalid backup file');
      }
    };
    reader.readAsText(file);
  }
};

// Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const today = () => new Date().toISOString().slice(0,10);
const genId = arr => arr.length ? Math.max(...arr.map(o=>o.id))+1 : 1;
const calcAge = d => Math.floor((Date.now() - new Date(d)) / 3.15576e10);

// Bootstrap minimal sample data
function bootstrapSampleData() {
  store.teachers = [
    {id:1, name:'Alice Johnson', hourlyRate:30},
    {id:2, name:'Bob Smith', hourlyRate:35}
  ];
  store.courses = [
    {id:1, name:'Math Level 1', hourlyRate:30, teacherId:1},
    {id:2, name:'English Level 1', hourlyRate:35, teacherId:2}
  ];
  store.students = [{
    id:1,
    name:'Charlie Brown',
    gender:'M',
    birthdate:'2010-03-15',
    age:calcAge('2010-03-15'),
    parent:'Lucy Brown',
    contact:'charlie@example.com',
    balances:{ 'Math Level 1': 5, 'English Level 1': 3 }
  }, {
    id:2,
    name:'Daisy Miller',
    gender:'F',
    birthdate:'2009-08-22',
    age:calcAge('2009-08-22'),
    parent:'Ann Miller',
    contact:'daisy@example.com',
    balances:{ 'English Level 1': 2 }
  }];
  store.payments = [{
    id:1, date:today(), studentId:1, courseId:1, teacherId:1,
    hourlyRate:30, purchasedHours:5, discountedTuition:0,
    amountPaid:150, paymentMethod:'Cash'
  }];
  store.sessions = [{
    id:1, date:today(), studentId:1, courseId:1, teacherId:1,
    startTime:'14:00', endTime:'15:00', hours:1
  }];
  store.expenses = [{
    id:1, date:today(), item:'Office Supplies', amount:25.50
  }];
}

// Navigation
let currentView = 'dashboard';
function switchView(view) {
  currentView = view;
  document.querySelectorAll('#main-nav .nav-link')
    .forEach(a => a.classList.toggle('active', a.dataset.view === view));
  render[view]();
}

// Rendering
const render = {
  dashboard() { recalcDashboard(); },

  students() {
    const rows = store.students.map(s=>`
      <tr>
        <td>${s.id}</td><td>${s.name}</td><td>${s.gender}</td>
        <td>${s.birthdate}</td><td>${s.age}</td><td>${s.parent}</td><td>${s.contact}</td>
        <td>${Object.entries(s.balances||{}).map(
          ([c,h])=>`<div class="${h<2?'low-balance':''}">${c}: ${h.toFixed(1)}</div>`
        ).join('')}</td>
        <td>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="openStudentModal(${s.id})">Edit</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      </tr>`).join('');
    $('#view-container').innerHTML = `
      <div class="d-flex justify-content-between mb-3">
        <h2>Students</h2>
        <button class="btn btn-primary btn-sm" onclick="openStudentModal()">Add Student</button>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered small">
          <thead class="table-light">
            <tr><th>ID</th><th>Name</th><th>Gender</th><th>Birthdate</th><th>Age</th>
            <th>Parent</th><th>Contact</th><th>Balances</th><th>Actions</th></tr>
          </thead><tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  teachers() {
    const rows = store.teachers.map(t=>`
      <tr>
        <td>${t.id}</td><td>${t.name}</td><td>$${t.hourlyRate}</td>
        <td>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="openTeacherModal(${t.id})">Edit</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteTeacher(${t.id})">Delete</button>
        </td>
      </tr>`).join('');
    $('#view-container').innerHTML = `
      <div class="d-flex justify-content-between mb-3">
        <h2>Teachers</h2>
        <button class="btn btn-primary btn-sm" onclick="openTeacherModal()">Add Teacher</button>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered small">
          <thead class="table-light"><tr><th>ID</th><th>Name</th><th>Rate</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  courses() {
    const rows = store.courses.map(c=>{
      const t = store.teachers.find(x=>x.id===c.teacherId)?.name||'Unassigned';
      return `
      <tr>
        <td>${c.id}</td><td>${c.name}</td><td>$${c.hourlyRate}</td><td>${t}</td>
        <td>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="openCourseModal(${c.id})">Edit</button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteCourse(${c.id})">Delete</button>
        </td>
      </tr>`;
    }).join('');
    $('#view-container').innerHTML = `
      <div class="d-flex justify-content-between mb-3">
        <h2>Courses</h2>
        <button class="btn btn-primary btn-sm" onclick="openCourseModal()">Add Course</button>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered small">
          <thead class="table-light"><tr><th>ID</th><th>Name</th><th>Rate</th><th>Teacher</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  payments() {
    const sOpt = store.students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    const cOpt = store.courses .map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
    const rows = store.payments.map(p=>{
      const sn = store.students.find(x=>x.id===p.studentId)?.name||'';
      const cn = store.courses .find(x=>x.id===p.courseId)?.name  ||'';
      return `
      <tr>
        <td>${p.date}</td><td>${sn}</td><td>${cn}</td><td>${p.purchasedHours}</td>
        <td>$${p.amountPaid}</td><td>${p.paymentMethod}</td>
        <td><button class="btn btn-outline-danger btn-sm" onclick="deletePayment(${p.id})">Delete</button></td>
      </tr>`;
    }).join('');
    $('#view-container').innerHTML = `
      <h2 class="mb-3">Record Payment</h2>
      <form id="paymentForm" class="row g-3 mb-4 small">
        <div class="col-2"><label>Date</label><input name="date" type="date" class="form-control" value="${today()}" required></div>
        <div class="col-3"><label>Student</label><select name="studentId" class="form-select" required><option></option>${sOpt}</select></div>
        <div class="col-3"><label>Course</label><select name="courseId" class="form-select" required><option></option>${cOpt}</select></div>
        <div class="col-2"><label>Hours</label><input name="purchasedHours" type="number" class="form-control" min="1" step="0.5" required></div>
        <div class="col-2"><label>Amount</label><input name="amountPaid" type="number" class="form-control" min="0" step="0.01" required></div>
        <div class="col-3"><label>Method</label><select name="paymentMethod" class="form-select" required><option>Cash</option><option>Card</option><option>Bank Transfer</option><option>Check</option><option>Online Payment</option></select></div>
        <div class="col-12"><button class="btn btn-primary btn-sm" type="submit">Add Payment</button></div>
      </form>
      <h3 class="mb-2">History</h3>
      <div class="table-responsive"><table class="table table-bordered small">
        <thead class="table-light">
          <tr><th>Date</th><th>Student</th><th>Course</th><th>Hrs</th><th>Amt</th><th>Method</th><th>Actions</th></tr>
        </thead><tbody>${rows}</tbody>
      </table></div>`;
    setTimeout(()=>{
      $('#paymentForm').addEventListener('submit', e=>{
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target).entries());
        d.id = genId(store.payments);
        d.studentId=+d.studentId; d.courseId=+d.courseId;
        const cr = store.courses.find(x=>x.id===d.courseId); if(!cr)return;
        d.teacherId=cr.teacherId; d.hourlyRate=cr.hourlyRate;
        d.purchasedHours=+d.purchasedHours; d.amountPaid=+d.amountPaid;
        d.discountedTuition=0; d.paymentMethod=d.paymentMethod||'Cash';
        store.payments.push(d);
        const st = store.students.find(x=>x.id===d.studentId);
        st.balances = st.balances||{};
        st.balances[cr.name] = (st.balances[cr.name]||0)+d.purchasedHours;
        store.save(); switchView('payments');
      });
    },50);
  },

  sessions() {
    const sOpt = store.students.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
    const cOpt = store.courses .map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
    const rows = store.sessions.map(s=>{
      const sn = store.students.find(x=>x.id===s.studentId)?.name||'';
      const cn = store.courses .find(x=>x.id===s.courseId)?.name  ||'';
      return `
      <tr>
        <td>${s.date}</td><td>${sn}</td><td>${cn}</td>
        <td>${s.hours.toFixed(1)}</td><td>${s.startTime}-${s.endTime}</td>
        <td><button class="btn btn-outline-danger btn-sm" onclick="deleteSession(${s.id})">Delete</button></td>
      </tr>`;
    }).join('');
    $('#view-container').innerHTML = `
      <h2 class="mb-3">Log Session</h2>
      <form id="sessionForm" class="row g-3 small mb-4">
        <div class="col-2"><label>Date</label><input name="date" type="date" class="form-control" value="${today()}" required></div>
        <div class="col-3"><label>Student</label><select name="studentId" class="form-select" required><option></option>${sOpt}</select></div>
        <div class="col-3"><label>Course</label><select name="courseId" class="form-select" required><option></option>${cOpt}</select></div>
        <div class="col-2"><label>Start</label><input name="startTime" type="time" class="form-control" required></div>
        <div class="col-2"><label>End</label><input name="endTime" type="time" class="form-control" required></div>
        <div class="col-12"><button class="btn btn-primary btn-sm" type="submit">Add Session</button></div>
      </form>
      <h3 class="mb-2">History</h3>
      <div class="table-responsive"><table class="table table-bordered small">
        <thead class="table-light">
          <tr><th>Date</th><th>Student</th><th>Course</th><th>Hrs</th><th>Time</th><th>Actions</th></tr>
        </thead><tbody>${rows}</tbody>
      </table></div>`;
    setTimeout(()=>{
      $('#sessionForm').addEventListener('submit', e=>{
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target).entries());
        d.id=genId(store.sessions);
        d.studentId=+d.studentId; d.courseId=+d.courseId;
        const diff=(parseTime(d.endTime)-parseTime(d.startTime))/36e5;
        if(diff<=0) return alert('End must be after start');
        d.hours=diff;
        const cr=store.courses.find(x=>x.id===d.courseId); if(!cr)return;
        d.teacherId=cr.teacherId;
        store.sessions.push(d);
        const st=store.students.find(x=>x.id===d.studentId);
        st.balances=st.balances||{};
        st.balances[cr.name]=Math.max(0,(st.balances[cr.name]||0)-d.hours);
        store.save(); switchView('sessions');
      });
    },50);
  },

  expenses() {
    const rows = store.expenses.map(e=>`
      <tr>
        <td>${e.date}</td><td>${e.item}</td><td>$${e.amount.toFixed(2)}</td>
        <td><button class="btn btn-outline-danger btn-sm" onclick="deleteExpense(${e.id})">Delete</button></td>
      </tr>`).join('');
    $('#view-container').innerHTML = `
      <h2 class="mb-3">Expenses</h2>
      <form id="expenseForm" class="row g-3 small mb-4">
        <div class="col-3"><label>Date</label><input name="date" type="date" class="form-control" value="${today()}" required></div>
        <div class="col-5"><label>Item</label><input name="item" class="form-control" required></div>
        <div class="col-2"><label>Amount</label><input name="amount" type="number" class="form-control" min="0" step="0.01" required></div>
        <div class="col-12"><button class="btn btn-primary btn-sm" type="submit">Add Expense</button></div>
      </form>
      <h3 class="mb-2">History</h3>
      <div class="table-responsive"><table class="table table-bordered small">
        <thead class="table-light"><tr><th>Date</th><th>Item</th><th>Amount</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
    setTimeout(()=>{
      $('#expenseForm').addEventListener('submit', e=>{
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target).entries());
        d.id = genId(store.expenses);
        d.amount = +d.amount;
        store.expenses.push(d);
        store.save(); switchView('expenses');
      });
    },50);
  },

  attendance() { renderAttendanceUI(); },
  reports()    { renderReportUI();    },

  settings() {
    const lastSaved = localStorage.getItem('tutoringCenterData') ? 
      JSON.parse(localStorage.getItem('tutoringCenterData')).lastSaved : null;
    const storageSize = localStorage.getItem('tutoringCenterData') ? 
      (JSON.stringify(localStorage.getItem('tutoringCenterData')).length / 1024).toFixed(1) : '0';

    $('#view-container').innerHTML = `
      <h2>Settings & Data Management</h2>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Data Status</h5>
              <p><strong>Last Saved:</strong> ${lastSaved ? new Date(lastSaved).toLocaleString() : 'Never'}</p>
              <p><strong>Storage Used:</strong> ${storageSize} KB</p>
              <button class="btn btn-primary btn-sm" onclick="store.save()">Force Save Now</button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Backup & Restore</h5>
              <div class="d-grid gap-2">
                <button class="btn btn-success btn-sm" onclick="store.export()">Export Backup</button>
                <input type="file" id="importFile" accept=".json" style="display:none"
                       onchange="store.import(this.files[0])">
                <button class="btn btn-info btn-sm" onclick="document.getElementById('importFile').click()">Import Backup</button>
                <button class="btn btn-danger btn-sm" onclick="if(confirm('Clear all data?')){localStorage.clear(); location.reload();}">Clear All Data</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Data Overview</h5>
              <div class="row text-center">
                <div class="col-md-2"><strong>${store.students.length}</strong><br><small>Students</small></div>
                <div class="col-md-2"><strong>${store.teachers.length}</strong><br><small>Teachers</small></div>
                <div class="col-md-2"><strong>${store.courses.length}</strong><br><small>Courses</small></div>
                <div class="col-md-2"><strong>${store.payments.length}</strong><br><small>Payments</small></div>
                <div class="col-md-2"><strong>${store.sessions.length}</strong><br><small>Sessions</small></div>
                <div class="col-md-2"><strong>${store.expenses.length}</strong><br><small>Expenses</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="mt-3 text-muted">All changes autosave to localStorage.</p>`;
  }
};

// Dashboard calculation function
function recalcDashboard() {
  const revenue = store.payments.reduce((sum,p)=>sum + p.amountPaid, 0);
  const salary  = store.sessions.reduce((sum,s)=>{
    const rate = store.teachers.find(t=>t.id===s.teacherId)?.hourlyRate||0;
    return sum + (s.hours||0)*rate;
  }, 0);
  const other   = store.expenses.reduce((sum,e)=>sum + e.amount, 0);
  const net     = revenue - salary - other;

  // Six-month chart data
  const labels = [], income = [], costs = [];
  for (let i=5; i>=0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth()-i);
    const key = d.toISOString().slice(0,7);
    labels.push(key);
    const mRev = store.payments.filter(p=>p.date.slice(0,7)===key)
                  .reduce((s,p)=>s+p.amountPaid,0);
    const mSal = store.sessions.filter(s=>s.date.slice(0,7)===key)
                  .reduce((s,ses)=>{
                    const r=store.teachers.find(t=>t.id===ses.teacherId)?.hourlyRate||0;
                    return s + (ses.hours||0)*r;
                  },0);
    const mExp = store.expenses.filter(e=>e.date.slice(0,7)===key)
                  .reduce((s,e)=>s+e.amount,0);
    income.push(mRev);
    costs.push(mSal + mExp);
  }

  // Render dashboard
  $('#view-container').innerHTML = `
    <div class="row row-cols-2 row-cols-md-4 g-3 mb-4">
      <div class="col"><div class="card text-center"><div class="card-body">
        <h6>Total Revenue</h6><h4 class="text-primary">$${revenue.toFixed(2)}</h4>
      </div></div></div>
      <div class="col"><div class="card text-center"><div class="card-body">
        <h6>Salary Expense</h6><h4 class="text-danger">$${salary.toFixed(2)}</h4>
      </div></div></div>
      <div class="col"><div class="card text-center"><div class="card-body">
        <h6>Other Costs</h6><h4 class="text-warning">$${other.toFixed(2)}</h4>
      </div></div></div>
      <div class="col"><div class="card text-center"><div class="card-body">
        <h6>Net Profit</h6><h4 class="text-success">$${net.toFixed(2)}</h4>
      </div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><h5>Income vs Costs (Last 6 Months)</h5></div>
      <div class="card-body" style="height:300px;"><canvas id="dashboardChart"></canvas></div>
    </div>`;

  // Draw chart
  setTimeout(()=>{
    const ctx = $('#dashboardChart');
    if (window.Chart && ctx) {
      if (window._dashInst) window._dashInst.destroy();
      window._dashInst = new Chart(ctx, {
        type:'bar',
        data:{labels, datasets:[
          {label:'Income', backgroundColor:'#1FB8CD', data:income},
          {label:'Costs', backgroundColor:'#B4413C', data:costs}
        ]},
        options:{responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true}}}
      });
    }
  },100);
}

// Attendance UI function
function renderAttendanceUI() {
  const { startInput, endInput } = dateRangeInputs();
  $('#view-container').innerHTML = `
    <h2 class="mb-3">Attendance & Salaries</h2>
    <div class="row g-3 align-items-end mb-3 small">${startInput}${endInput}
      <div class="col-auto"><button class="btn btn-sm btn-primary" onclick="renderAttendanceTable()">Run Report</button></div>
    </div>
    <div id="attendanceTableWrap"></div>`;
  renderAttendanceTable();
}

// Report UI function  
function renderReportUI() {
  const { startInput, endInput } = dateRangeInputs();
  $('#view-container').innerHTML = `
    <h2 class="mb-3">Financial Reports</h2>
    <div class="row g-3 align-items-end mb-3 small">${startInput}${endInput}
      <div class="col-auto"><button class="btn btn-sm btn-primary" onclick="generateReport()">Run Report</button></div>
      <div class="col-auto"><button class="btn btn-sm btn-outline-secondary" onclick="exportCsv()">Export CSV</button></div>
    </div>
    <div id="reportOutput"></div>`;
  generateReport();
}

// Date range input helper
function dateRangeInputs() {
  const today = new Date();
  const thirtyAgo = new Date();
  thirtyAgo.setDate(today.getDate() - 30);
  
  const startHtml = `<div class="col-md-3">
    <label class="form-label">Start Date</label>
    <input type="date" class="form-control" id="startDate" value="${thirtyAgo.toISOString().slice(0, 10)}">
  </div>`;
  
  const endHtml = `<div class="col-md-3">
    <label class="form-label">End Date</label>
    <input type="date" class="form-control" id="endDate" value="${today.toISOString().slice(0, 10)}">
  </div>`;
  
  return { startInput: startHtml, endInput: endHtml };
}

// Render attendance table
function renderAttendanceTable() {
  const startEl = $('#startDate');
  const endEl = $('#endDate');
  const start = startEl ? startEl.value : '';
  const end = endEl ? endEl.value : '';
  const data = aggregateTeacherHours(start, end);
  const rows = data.map(d => 
    `<tr><td>${d.teacher}</td><td>${d.totalHours.toFixed(1)}</td><td>$${d.hourlyRate}</td><td>$${d.salary.toFixed(2)}</td></tr>`
  ).join('');
  
  const wrapEl = $('#attendanceTableWrap');
  if (wrapEl) {
    wrapEl.innerHTML = `<div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr><th>Teacher</th><th>Total Hours</th><th>Hourly Rate</th><th>Salary</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }
}

// Aggregate teacher hours
function aggregateTeacherHours(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const byTeacher = {};
  
  store.sessions.forEach(sess => {
    const d = new Date(sess.date);
    if (d >= s && d <= e) {
      if (!byTeacher[sess.teacherId]) byTeacher[sess.teacherId] = 0;
      byTeacher[sess.teacherId] += sess.hours || 0;
    }
  });
  
  return Object.entries(byTeacher).map(([tid, totalHours]) => {
    const teacher = store.teachers.find(t => t.id === Number(tid));
    return {
      teacher: teacher?.name || 'Unknown',
      totalHours,
      hourlyRate: teacher?.hourlyRate || 0,
      salary: totalHours * (teacher?.hourlyRate || 0)
    };
  });
}

// Generate report
function generateReport() {
  const startEl = $('#startDate');
  const endEl = $('#endDate');
  const start = startEl ? startEl.value : '';
  const end = endEl ? endEl.value : '';
  const fin = aggregateFinancials(start, end);
  
  const summaryHtml = `<div class="row row-cols-2 row-cols-md-4 g-3 mb-4">
    <div class="col"><div class="card text-center"><div class="card-body"><h6>Revenue</h6><h4>$${fin.revenue.toFixed(2)}</h4></div></div></div>
    <div class="col"><div class="card text-center"><div class="card-body"><h6>Salary Expense</h6><h4>$${fin.salary.toFixed(2)}</h4></div></div></div>
    <div class="col"><div class="card text-center"><div class="card-body"><h6>Other Expenses</h6><h4>$${fin.other.toFixed(2)}</h4></div></div></div>
    <div class="col"><div class="card text-center"><div class="card-body"><h6>Net Profit</h6><h4>$${fin.net.toFixed(2)}</h4></div></div></div>
  </div>`;
  
  const courseRows = fin.courseDetails.map(c => 
    `<tr><td>${c.course}</td><td>${c.enrollment}</td><td>$${c.revenue.toFixed(2)}</td><td>$${c.salary.toFixed(2)}</td><td>${c.outstanding.toFixed(1)}</td></tr>`
  ).join('');
  
  const coursesTable = `<h5>Course Level Analysis</h5>
    <div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr><th>Course</th><th>Enrollments</th><th>Revenue</th><th>Salary</th><th>Outstanding Hours</th></tr>
        </thead>
        <tbody>${courseRows}</tbody>
      </table>
    </div>`;
  
  const teacherRows = fin.teacherDetails.map(t => 
    `<tr><td>${t.teacher}</td><td>${t.signed.toFixed(1)}</td><td>${t.taught.toFixed(1)}</td><td>${t.remaining.toFixed(1)}</td></tr>`
  ).join('');
  
  const teacherTable = `<h5 class="mt-4">Teacher Level Analysis</h5>
    <div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr><th>Teacher</th><th>Signed Hours</th><th>Taught Hours</th><th>Remaining</th></tr>
        </thead>
        <tbody>${teacherRows}</tbody>
      </table>
    </div>`;

  const outputEl = $('#reportOutput');
  if (outputEl) {
    outputEl.innerHTML = summaryHtml + coursesTable + teacherTable;
  }
}

// Aggregate financials
function aggregateFinancials(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  
  const payments = store.payments.filter(p => {
    const d = new Date(p.date);
    return d >= s && d <= e;
  });
  
  const revenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  
  const sessions = store.sessions.filter(ses => {
    const d = new Date(ses.date);
    return d >= s && d <= e;
  });
  
  const salary = sessions.reduce((sum, ses) => {
    const rate = store.teachers.find(t => t.id === ses.teacherId)?.hourlyRate || 0;
    return sum + (ses.hours || 0) * rate;
  }, 0);
  
  const other = store.expenses.filter(ex => {
    const d = new Date(ex.date);
    return d >= s && d <= e;
  }).reduce((s, e) => s + e.amount, 0);
  
  const net = revenue - salary - other;

  // Course details
  const courseDetails = store.courses.map(c => {
    const enroll = new Set(payments.filter(p => p.courseId === c.id).map(p => p.studentId)).size;
    const cRev = payments.filter(p => p.courseId === c.id).reduce((s, p) => s + p.amountPaid, 0);
    const cSalary = sessions.filter(s => s.courseId === c.id).reduce((s2, ses) => {
      const tRate = store.teachers.find(t => t.id === ses.teacherId)?.hourlyRate || 0;
      return s2 + (ses.hours || 0) * tRate;
    }, 0);
    const outstanding = store.students.reduce((acc, stu) => acc + (stu.balances?.[c.name] || 0), 0);
    return { course: c.name, enrollment: enroll, revenue: cRev, salary: cSalary, outstanding };
  });
  
  // Teacher details
  const teacherDetails = store.teachers.map(t => {
    const signed = payments.filter(p => p.teacherId === t.id).reduce((s, p) => s + p.purchasedHours, 0);
    const taught = sessions.filter(s => s.teacherId === t.id).reduce((s, ses) => s + (ses.hours || 0), 0);
    return { teacher: t.name, signed, taught, remaining: signed - taught };
  });

  return { revenue, salary, other, net, courseDetails, teacherDetails };
}

// Export CSV
function exportCsv() {
  const startEl = $('#startDate');
  const endEl = $('#endDate');
  const start = startEl ? startEl.value : '';
  const end = endEl ? endEl.value : '';
  const fin = aggregateFinancials(start, end);
  
  let csv = 'Financial Report Summary\n';
  csv += `Period: ${start} to ${end}\n\n`;
  csv += `Revenue,$${fin.revenue.toFixed(2)}\n`;
  csv += `Salary Expense,$${fin.salary.toFixed(2)}\n`;
  csv += `Other Expenses,$${fin.other.toFixed(2)}\n`;
  csv += `Net Profit,$${fin.net.toFixed(2)}\n\n`;
  
  csv += 'Course Analysis\n';
  csv += 'Course,Enrollments,Revenue,Salary,Outstanding Hours\n';
  fin.courseDetails.forEach(c => {
    csv += `${c.course},${c.enrollment},$${c.revenue.toFixed(2)},$${c.salary.toFixed(2)},${c.outstanding.toFixed(1)}\n`;
  });
  
  csv += '\nTeacher Analysis\n';
  csv += 'Teacher,Signed Hours,Taught Hours,Remaining\n';
  fin.teacherDetails.forEach(t => {
    csv += `${t.teacher},${t.signed.toFixed(1)},${t.taught.toFixed(1)},${t.remaining.toFixed(1)}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tutoring_report_${start}_to_${end}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Modal system
let currentModal = null;

function openModal(title, bodyHtml, onSave) {
  const modalElem = $('#globalModal');
  if (!modalElem) {
    console.error('Modal element not found');
    return;
  }
  
  const modalContent = $('#globalModalContent');
  modalContent.innerHTML = `
    <div class="modal-header">
      <h5 class="modal-title">${title}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>
    <form id="modalForm">
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>`;
  
  const form = $('#modalForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (onSave(data) !== false) {
      currentModal.hide();
    }
  });
  
  currentModal = new bootstrap.Modal(modalElem);
  currentModal.show();
}

// Modal functions
function openStudentModal(id) {
  const existing = store.students.find(s => s.id === id) || { name: '', gender: 'F', birthdate: '', parent: '', contact: '' };
  openModal(id ? 'Edit Student' : 'Add Student', `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Name</label>
        <input class="form-control" name="name" value="${existing.name}" required>
      </div>
      <div class="col-md-3">
        <label class="form-label">Gender</label>
        <select class="form-select" name="gender">
          <option value="F" ${existing.gender === 'F' ? 'selected' : ''}>Female</option>
          <option value="M" ${existing.gender === 'M' ? 'selected' : ''}>Male</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Birthdate</label>
        <input type="date" class="form-control" name="birthdate" value="${existing.birthdate}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Parent</label>
        <input class="form-control" name="parent" value="${existing.parent || ''}">
      </div>
      <div class="col-md-6">
        <label class="form-label">Contact</label>
        <input class="form-control" name="contact" value="${existing.contact || ''}">
      </div>
    </div>`, data => {
      if (id) {
        Object.assign(existing, data);
        existing.age = calcAge(existing.birthdate);
      } else {
        const newStudent = {
          id: genId(store.students),
          ...data,
          age: calcAge(data.birthdate),
          balances: {}
        };
        store.students.push(newStudent);
      }
      store.save();
      switchView('students');
    });
}

function openTeacherModal(id) {
  const existing = store.teachers.find(t => t.id === id) || { name: '', hourlyRate: '' };
  openModal(id ? 'Edit Teacher' : 'Add Teacher', `
    <div class="row g-3">
      <div class="col-md-8">
        <label class="form-label">Name</label>
        <input class="form-control" name="name" value="${existing.name}" required>
      </div>
      <div class="col-md-4">
        <label class="form-label">Hourly Rate</label>
        <input type="number" step="0.01" class="form-control" name="hourlyRate" value="${existing.hourlyRate}" required>
      </div>
    </div>`, data => {
      data.hourlyRate = parseFloat(data.hourlyRate);
      if (id) {
        Object.assign(existing, data);
      } else {
        store.teachers.push({ id: genId(store.teachers), ...data });
      }
      store.save();
      switchView('teachers');
    });
}

function openCourseModal(id) {
  const existing = store.courses.find(c => c.id === id) || { name: '', hourlyRate: '', teacherId: '' };
  const teacherOptions = store.teachers.map(t => 
    `<option value="${t.id}" ${t.id === existing.teacherId ? 'selected' : ''}>${t.name}</option>`
  ).join('');
  
  openModal(id ? 'Edit Course' : 'Add Course', `
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Name</label>
        <input class="form-control" name="name" value="${existing.name}" required>
      </div>
      <div class="col-md-3">
        <label class="form-label">Hourly Rate</label>
        <input type="number" step="0.01" class="form-control" name="hourlyRate" value="${existing.hourlyRate}" required>
      </div>
      <div class="col-md-3">
        <label class="form-label">Teacher</label>
        <select class="form-select" name="teacherId" required>
          <option value="">Select Teacher</option>
          ${teacherOptions}
        </select>
      </div>
    </div>`, data => {
      data.hourlyRate = parseFloat(data.hourlyRate);
      data.teacherId = Number(data.teacherId);
      if (id) {
        Object.assign(existing, data);
      } else {
        store.courses.push({ id: genId(store.courses), ...data });
      }
      store.save();
      switchView('courses');
    });
}

// Delete handlers
function deleteStudent(id){ if(confirm('Delete this student?')){ store.students=store.students.filter(x=>x.id!==id); store.save(); switchView('students'); }}
function deleteTeacher(id){ if(confirm('Delete this teacher?')){ store.courses.forEach(c=>c.teacherId===id&&(c.teacherId=null)); store.teachers=store.teachers.filter(x=>x.id!==id); store.save(); switchView('teachers'); }}
function deleteCourse(id){ if(confirm('Delete this course?')){ store.courses=store.courses.filter(x=>x.id!==id); store.save(); switchView('courses'); }}
function deletePayment(id){ if(confirm('Delete this payment?')){ store.payments=store.payments.filter(x=>x.id!==id); store.save(); switchView('payments'); }}
function deleteSession(id){ if(confirm('Delete this session?')){ store.sessions=store.sessions.filter(x=>x.id!==id); store.save(); switchView('sessions'); }}
function deleteExpense(id){ if(confirm('Delete this expense?')){ store.expenses=store.expenses.filter(x=>x.id!==id); store.save(); switchView('expenses'); }}

// Utility to parse "HH:MM" into Date
function parseTime(t){ const [h,m]=t.split(':').map(Number); const D=new Date(); D.setHours(h,m,0,0); return D; }

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  store.load();
  document.querySelectorAll('#main-nav .nav-link').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      if (a.dataset.view) switchView(a.dataset.view);
    });
  });
  switchView('dashboard');
});
