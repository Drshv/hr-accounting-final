let departments = [];
let positions = [];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', function() {
    loadLists();
    loadEmployees();

    document.getElementById('addEmployeeBtn').addEventListener('click', function() {
        document.getElementById('employeeForm').style.display = 'block';
    });

    document.getElementById('cancelForm').addEventListener('click', function() {
        document.getElementById('employeeForm').style.display = 'none';
        document.getElementById('employeeFormData').reset();
    });

    document.getElementById('employeeFormData').addEventListener('submit', function(e) {
        e.preventDefault();
        addEmployee();
    });

    document.getElementById('applyFilters').addEventListener('click', function() {
        filterEmployees();
    });

    document.getElementById('clearFilters').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterDepartment').value = '';
        document.getElementById('filterPosition').value = '';
        displayEmployees(allEmployees);
    });

    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterEmployees();
        }
    });
});

function loadLists() {
    fetch('/api/lists')
        .then(response => response.json())
        .then(data => {
            departments = data.departments;
            positions = data.positions;
            
            const deptSelect = document.getElementById('departmentSelect');
            const posSelect = document.getElementById('positionSelect');
            const filterDept = document.getElementById('filterDepartment');
            const filterPos = document.getElementById('filterPosition');
            
            data.departments.forEach(dept => {
                const option1 = document.createElement('option');
                option1.value = dept.id;
                option1.textContent = dept.name;
                deptSelect.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = dept.id;
                option2.textContent = dept.name;
                filterDept.appendChild(option2);
            });
            
            data.positions.forEach(pos => {
                const option1 = document.createElement('option');
                option1.value = pos.id;
                option1.textContent = pos.name;
                posSelect.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = pos.id;
                option2.textContent = pos.name;
                filterPos.appendChild(option2);
            });
        })
        .catch(error => console.error('Error loading lists:', error));
}

function loadEmployees() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(employees => {
            allEmployees = employees;
            displayEmployees(employees);
        })
        .catch(error => console.error('Error:', error));
}

function filterEmployees() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const departmentId = document.getElementById('filterDepartment').value;
    const positionId = document.getElementById('filterPosition').value;
    
    let filtered = allEmployees;
    
    if (searchTerm) {
        filtered = filtered.filter(emp => 
            emp.full_name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (departmentId) {
        filtered = filtered.filter(emp => 
            emp.department_id == departmentId
        );
    }
    
    if (positionId) {
        filtered = filtered.filter(emp => 
            emp.position_id == positionId
        );
    }
    
    displayEmployees(filtered);
}

function addEmployee() {
    const form = document.getElementById('employeeFormData');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    fetch('/api/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        form.reset();
        document.getElementById('employeeForm').style.display = 'none';
        loadEmployees();
    })
    .catch(error => console.error('Error:', error));
}

function fireEmployee(id) {
    if (confirm('Are you sure you want to fire this employee?')) {
        fetch(`/api/employees/${id}/fire`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadEmployees();
        })
        .catch(error => console.error('Error:', error));
    }
}

function displayEmployees(employees) {
    const tableDiv = document.getElementById('employeeTable');
    
    let html = '<table>';
    html += '<tr>';
    html += '<th>ID</th>';
    html += '<th>Full Name</th>';
    html += '<th>Birth Date</th>';
    html += '<th>Passport</th>';
    html += '<th>Phone</th>';
    html += '<th>Department</th>';
    html += '<th>Position</th>';
    html += '<th>Salary</th>';
    html += '<th>Status</th>';
    html += '<th>Actions</th>';
    html += '</tr>';

    employees.forEach(emp => {
        const rowClass = emp.is_fired === 1 ? 'fired' : '';
        html += `<tr class="${rowClass}">`;
        html += `<td>${emp.id}</td>`;
        html += `<td>${emp.full_name}</td>`;
        html += `<td>${emp.birth_date}</td>`;
        html += `<td>${emp.passport_series} ${emp.passport_number}</td>`;
        html += `<td>${emp.phone}</td>`;
        html += `<td>${emp.department_name}</td>`;
        html += `<td>${emp.position_name}</td>`;
        html += `<td>${emp.salary}</td>`;
        html += `<td>${emp.is_fired === 1 ? 'Fired' : 'Active'}</td>`;
        html += '<td>';
        if (emp.is_fired !== 1) {
            html += `<button onclick="fireEmployee(${emp.id})">Fire</button>`;
        } else {
            html += '<button disabled>Fired</button>';
        }
        html += '</td>';
        html += '</tr>';
    });

    html += '</table>';
    tableDiv.innerHTML = html;
}