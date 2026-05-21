// C:\AI-Exam-System\backend\src\middleware\adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access denied" });
  }
  next();
};

export default adminMiddleware;
