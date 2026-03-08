export const checkRole = (req, res, next) => {
  const userRole = req.user.role;
  
  req.isAdmin = userRole === 'admin';
  req.isDoctor = userRole === 'doctor';
  req.isNurse = userRole === 'nurse';
  req.isPatient = userRole === 'patient';
  
  next();
};