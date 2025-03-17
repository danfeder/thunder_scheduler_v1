import React from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';

interface Class {
  id: string;
  name: string;
  grade: number;
  teacherId: string;
}

interface ClassManagerProps {
  classes: Class[];
  onClassSelect: (classId: string) => void;
  onClassAdd: (classData: Omit<Class, 'id'>) => void;
  onClassUpdate: (classId: string, updates: Partial<Class>) => void;
  onClassDelete: (classId: string) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({
  classes,
  onClassSelect,
  onClassAdd,
  onClassUpdate,
  onClassDelete,
}) => {
  return (
    <Card 
      title="Class Manager"
      className="w-full"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-2">
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Open add class modal
                console.log('Add class clicked');
              }}
            >
              Add Class
            </Button>
          </div>
          <div className="space-x-2">
            <Button variant="secondary">Import</Button>
            <Button variant="secondary">Export</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((classItem) => (
                <tr 
                  key={classItem.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onClassSelect(classItem.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {classItem.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Grade {classItem.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {classItem.teacherId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open edit modal
                        console.log('Edit clicked', classItem.id);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClassDelete(classItem.id);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default ClassManager;