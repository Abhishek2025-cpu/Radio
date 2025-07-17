const router = require('express').Router();
const employeeCtrl = require('../../controllers/app/employeesController');

router.post('/register', employeeCtrl.registerEmployee);
router.post('/login', employeeCtrl.loginEmployee);
router.patch('/update/:id', employeeCtrl.updateEmployee);
router.delete('/delete/:id', employeeCtrl.deleteEmployee);
router.patch('/toggle-status/:id', employeeCtrl.toggleEmployeeStatus);

module.exports = router;
