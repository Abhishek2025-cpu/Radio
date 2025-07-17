// POST /api/employees/register
const Employee = require('../../models/mongo/Employee');

exports.registerEmployee = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email.endsWith('@uradio.ma')) {
      return res.status(400).json({ message: 'Email must end with @uradio.ma' });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Employee already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ success: true, employee: newEmployee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// POST /api/employees/login
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ success: true, employee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// PATCH /api/employees/update/:id
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.email && !updates.email.endsWith('@uradio.ma')) {
      return res.status(400).json({ message: 'Email must end with @uradio.ma' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, { new: true });
    res.json({ success: true, employee: updatedEmployee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// DELETE /api/employees/delete/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.findByIdAndDelete(id);
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// PATCH /api/employees/toggle-status/:id
exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    employee.isActive = !employee.isActive;
    await employee.save();

    res.json({ success: true, isActive: employee.isActive });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
