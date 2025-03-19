import { Router, Request, Response, NextFunction } from 'express';
import { ClassService } from '../services/class.service';
import { ClassCreate, Day } from '../types';
import { AsyncRequestHandler } from '../types/express';
import prisma from '../lib/prisma';

const router = Router();
const classService = new ClassService(prisma);

interface ImportRequest {
  csvData: string;
}

// Get all classes
const getAllClasses: AsyncRequestHandler = async (_req, res) => {
  console.log('[DEBUG] Getting all classes');
  const classes = await classService.getAllClasses();
  console.log('[DEBUG] Classes retrieved:', classes);
  const response = {
    data: classes,
    success: true
  };
  console.log('[DEBUG] Sending response:', response);
  res.json(response);
};

// Get a single class by ID
const getClassById: AsyncRequestHandler<{ id: string }> = async (req, res) => {
  console.log('[DEBUG] Getting class by ID:', req.params.id);
  const classItem = await classService.getClassById(req.params.id);
  console.log('[DEBUG] Class retrieved:', classItem);
  
  if (!classItem) {
    console.log('[DEBUG] Class not found');
    return res.status(404).json({
      error: 'Class not found',
      success: false
    });
  }
  
  const response = {
    data: classItem,
    success: true
  };
  console.log('[DEBUG] Sending response:', response);
  res.json(response);
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

// Update class conflicts
const updateClassConflicts: AsyncRequestHandler<
  { id: string },
  any,
  { day: string; periods: number[] }[]
> = async (req, res) => {
  const { id } = req.params;
  const conflicts = req.body;
  
  if (!conflicts || !Array.isArray(conflicts)) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Missing or invalid conflicts data',
      success: false
    });
  }
  
  try {
    // Format conflicts to match the ClassCreate interface
    const formattedConflicts = conflicts.map(conflict => ({
      day: conflict.day as Day,
      periods: conflict.periods
    }));
    
    // Update the class with new conflicts
    const updatedClass = await classService.updateClass(id, {
      conflicts: formattedConflicts
    });
    
    res.json({
      data: updatedClass,
      success: true
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Failed to update class conflicts',
      message: error.message,
      success: false
    });
  }
};

// Register routes
router.get('/', asyncHandler(getAllClasses));
router.get('/:id', asyncHandler<{ id: string }>(getClassById));
router.post('/', asyncHandler<{}, any, ClassCreate>(createClass));
router.put('/:id', asyncHandler<{ id: string }, any, Partial<ClassCreate>>(updateClass));
router.delete('/:id', asyncHandler<{ id: string }>(deleteClass));
router.post('/import', asyncHandler<{}, any, ImportRequest>(importClasses));
router.put('/:id/conflicts', asyncHandler<{ id: string }, any, { day: string; periods: number[] }[]>(updateClassConflicts));

export default router;