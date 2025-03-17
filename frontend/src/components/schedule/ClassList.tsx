import React from 'react';
import { Class } from '../../types/class.types';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { CSVService } from '../../services/csvService';

interface ClassListProps {
  classes: Class[];
  isLoading: boolean;
  onClassSelect?: (classId: string) => void;
  selectedClassId?: string;
}

const ClassList: React.FC<ClassListProps> = ({
  classes,
  isLoading,
  onClassSelect,
  selectedClassId,
}) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await CSVService.importClasses(file);
      if (result.success) {
        console.log('Classes imported successfully');
      } else {
        console.error('Import failed:', result.errors);
      }
    } catch (error) {
      console.error('Error importing classes:', error);
    }
  };

  return (
    <Card 
      title="Classes" 
      subtitle={`${classes.length} classes total`}
      footer={
        <div className="flex justify-between items-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="secondary" size="sm" as="span">
              Import CSV
            </Button>
          </label>
          <Button variant="primary" size="sm">
            Add Class
          </Button>
        </div>
      }
    >
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="text-center py-4">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No classes available. Import classes or add them manually.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className={`py-4 cursor-pointer transition-colors ${
                selectedClassId === cls.id
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onClassSelect?.(cls.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Grade {cls.gradeLevel}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {cls.conflicts.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {cls.conflicts.length} conflicts
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality will be implemented later
                      console.log('Edit class:', cls.id);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ClassList;