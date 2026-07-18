import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Admin, { IAdmin } from '../models/Admin';

export interface AuthRequest extends Request {
  admin?: IAdmin;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

      req.admin = await Admin.findById(decoded.id).select('-password') as IAdmin;
      if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized, admin not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const superAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.admin && req.admin.role === 'Super Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Super Admin' });
  }
};

export const manager = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.admin && (req.admin.role === 'Super Admin' || req.admin.role === 'Manager')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Manager' });
  }
};
