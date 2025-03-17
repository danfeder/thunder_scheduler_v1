import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Schedule, ScheduleState } from '../types/schedule.types';
import { Class } from '../types/class.types';
import { ScheduleService } from '../services/scheduleService';

// Action types
type ScheduleAction =
  | { type: 'SET_SCHEDULE'; payload: Schedule }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_ASSIGNMENT'; payload: { classId: string; updates: any } }
  | { type: 'CLEAR_SCHEDULE' };

// Initial state
const initialState: ScheduleState = {
  schedule: null,
  isLoading: false,
  error: null,
  lastUpdate: null,
};

// Context
interface ScheduleContextType extends ScheduleState {
  loadSchedule: (scheduleId: string) => Promise<void>;
  generateSchedule: (params: {
    startDate: string;
    endDate: string;
    rotationWeeks: number;
  }) => Promise<void>;
  updateAssignment: (classId: string, updates: any) => Promise<void>;
  clearSchedule: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Reducer
function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case 'SET_SCHEDULE':
      return {
        ...state,
        schedule: action.payload,
        lastUpdate: new Date().toISOString(),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'UPDATE_ASSIGNMENT':
      if (!state.schedule) return state;
      return {
        ...state,
        schedule: {
          ...state.schedule,
          assignments: state.schedule.assignments.map((assignment) =>
            assignment.classId === action.payload.classId
              ? { ...assignment, ...action.payload.updates }
              : assignment
          ),
        },
      };
    case 'CLEAR_SCHEDULE':
      return initialState;
    default:
      return state;
  }
}

// Provider
export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  const loadSchedule = async (scheduleId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const schedule = await ScheduleService.getSchedule(scheduleId);
      dispatch({ type: 'SET_SCHEDULE', payload: schedule });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load schedule',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateSchedule = async (params: {
    startDate: string;
    endDate: string;
    rotationWeeks: number;
  }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const schedule = await ScheduleService.generateSchedule(params);
      dispatch({ type: 'SET_SCHEDULE', payload: schedule });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to generate schedule',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAssignment = async (classId: string, updates: any) => {
    if (!state.schedule) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await ScheduleService.updateAssignment(state.schedule.id, {
        classId,
        ...updates,
      });
      dispatch({ type: 'SET_SCHEDULE', payload: response.data });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to update assignment',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearSchedule = () => {
    dispatch({ type: 'CLEAR_SCHEDULE' });
  };

  return (
    <ScheduleContext.Provider
      value={{
        ...state,
        loadSchedule,
        generateSchedule,
        updateAssignment,
        clearSchedule,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

// Custom hook
export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

export default ScheduleContext;