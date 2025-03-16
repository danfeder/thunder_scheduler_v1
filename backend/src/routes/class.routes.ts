import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ClassService } from '../services/class.service';
import { ClassCreate } from '../types';
import { AsyncRequestHandler } from '../types/express';

const router = Router();
const classService = new ClassService(prisma);

interface ImportRequest {
  csvData: string;
}

// Get all classes
const getAllClasses: AsyncRequestHandler = async (_req, res) => {
  const classes = await classService.getAllClasses();
  res.json(classes);
};

// Get a single class by ID
const getClassById: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  const classItem = await classService.getClassById(req.params.id);
  if (!classItem) {
    return res.status(404).json({ error: 'Class not found' });
  }
  res.json(classItem);
};

// Create a new class
const createClass: AsyncRequestHandler<{}, any, ClassCreate> = async (req, res) => {
  const classData: ClassCreate = req.body;
  const newClass = await classService.createClass(classData);
  res.status(201).json(newClass);
};

// Update a class
const updateClass: AsyncRequestHandler<{ id: string }, any, Partial<ClassCreate>> = async (
  req,
  res
) => {
  const classData: Partial<ClassCreate> = req.body;
  const updatedClass = await classService.updateClass(req.params.id, classData);
  if (!updatedClass) {
    return res.status(404).json({ error: 'Class not found' });
  }
  res.json(updatedClass);
};

// Delete a class
const deleteClass: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  const deletedClass = await classService.deleteClass(req.params.id);
  res.json(deletedClass);
};

// Import classes from CSV
const importClasses: AsyncRequestHandler<{}, any, ImportRequest> = async (req, res) => {
  const { csvData } = req.body;
  if (!csvData) {
    return res.status(400).json({ error: 'CSV data is required' });
  }
  const importedClasses = await classService.importClassesFromCSV(csvData);
  res.status(201).json(importedClasses);
};

// Error wrapper for async handlers
const asyncHandler = <P = {}, ResBody = any, ReqBody = any>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody>
) => {
  return async (req: Request<P, ResBody, ReqBody>, res: Response<ResBody>, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Register routes
router.get('/', asyncHandler(getAllClasses));
router.get('/:id', asyncHandler<{ id: string }>(getClassById));
router.post('/', asyncHandler<{}, any, ClassCreate>(createClass));
router.put('/:id', asyncHandler<{ id: string }, any, Partial<ClassCreate>>(updateClass));
router.delete('/:id', asyncHandler<{ id: string }>(deleteClass));
router.post('/import', asyncHandler<{}, any, ImportRequest>(importClasses));

export default router;