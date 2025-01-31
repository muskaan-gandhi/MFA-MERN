import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token 
  
  try{
    if(!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.user = decoded.userId;
    next();

  } catch (error) {
    console.log("Error verifying token", error);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}