let departments = [];
let positions = [];
let allEmployees = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    loadLists();
    loadEmployees();

    document.getElementById('addEmployeeBtn').addEventListener('click', function() {
        console.log('Add button clicked');
        editingId = null;
        document.getElementById('formTitle').textContent = 'Add New Employee';
        document.getElementById('employeeForm').style.display = 'block';
        document.getElementById('employeeFormData').reset();
    });

    document.getElementById('cancelForm').addEventListener('click', function() {
        document.getElementById('employeeForm').style.display = 'none';
        document.getElementById('employeeFormData').reset();
        editingId = null;
    });

    document.getElementById('employeeFormData').addEventListener('submit', function(e) {
        e.preventDefault();
        if (editingId) {
            updateEmployee();
        } else {
            addEmployee();
        }
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

    // Маски ввода
    setTimeout(() => {
        const phoneInput = document.querySelector('input[name="phone"]');
        if (phoneInput && typeof IMask !== 'undefined') {
            IMask(phoneInput, {
                mask: '+{7}(000)000-00-00'
            });
        }

        const seriesInput = document.querySelector('input[name="passport_series"]');
        if (seriesInput && typeof IMask !== 'undefined') {
            IMask(seriesInput, {
                mask: '0000'
            });
        }

        const numberInput = document.querySelector('input[name="passport_number"]');
        if (numberInput && typeof IMask !== 'undefined') {
            IMask(numberInput, {
                mask: '000000'
            });
        }
    }, 500);
});

function loadLists() {
    console.log('Loading lists...');
    fetch('/api/lists')
        .then(response => response.json())
        .then(data => {
            console.log('Lists loaded:', data);
            departments = data.departments;
            positions = data.positions;
            
            const deptSelect = document.getElementById('departmentSelect');
            const posSelect = document.getElementById('positionSelect');
            const filterDept = document.getElementById('filterDepartment');
            const filterPos = document.getElementById('filterPosition');
            
            // Очищаем существующие опции (кроме первой)
            while (deptSelect.options.length > 0) {
                deptSelect.remove(0);
            }
            while (posSelect.options.length > 0) {
                posSelect.remove(0);
            }
            while (filterDept.options.length > 1) {
                filterDept.remove(1);
            }
            while (filterPos.options.length > 1) {
                filterPos.remove(1);
            }
            
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

function updateEmployee() {
    const form = document.getElementById('employeeFormData');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    fetch(`/api/employees/${editingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            alert('Error: ' + result.error);
        } else {
            alert(result.message);
            form.reset();
            document.getElementById('employeeForm').style.display = 'none';
            editingId = null;
            loadEmployees();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating employee');
    });
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

function editEmployee(id) {
    const employee = allEmployees.find(emp => emp.id === id);
    if (!employee) return;
    
    editingId = id;
    document.getElementById('formTitle').textContent = 'Edit Employee';
    
    document.querySelector('input[name="full_name"]').value = employee.full_name;
    document.querySelector('input[name="birth_date"]').value = employee.birth_date;
    document.querySelector('input[name="passport_series"]').value = employee.passport_series;
    document.querySelector('input[name="passport_number"]').value = employee.passport_number;
    document.querySelector('input[name="phone"]').value = employee.phone;
    document.querySelector('input[name="email"]').value = employee.email || '';
    document.querySelector('textarea[name="address"]').value = employee.address;
    document.querySelector('select[name="department_id"]').value = employee.department_id;
    document.querySelector('select[name="position_id"]').value = employee.position_id;
    document.querySelector('input[name="salary"]').value = employee.salary;
    document.querySelector('input[name="hire_date"]').value = employee.hire_date;
    
    document.getElementById('employeeForm').style.display = 'block';
    document.getElementById('employeeForm').scrollIntoView({ behavior: 'smooth' });
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
            html += `<button onclick="editEmployee(${emp.id})">Edit</button> `;
            html += `<button onclick="fireEmployee(${emp.id})">Fire</button>`;
        } else {
            html += '<button disabled>Edit</button> ';
            html += '<button disabled>Fire</button>';
        }
        html += '</td>';
        html += '</tr>';
    });

    html += '</table>';
    tableDiv.innerHTML = html;
}