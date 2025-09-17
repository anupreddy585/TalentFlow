import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react';
import { AssessmentSection as AssessmentSectionType, Question } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QuestionEditor } from './QuestionEditor';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface AssessmentSectionProps {
  section: AssessmentSectionType;
  sectionIndex: number;
  onUpdate: (updates: Partial<AssessmentSectionType>) => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestions: (questions: Question[]) => void;
}

export function AssessmentSection({
  section,
  sectionIndex,
  onUpdate,
  onDelete,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
}: AssessmentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = section.questions.findIndex(q => q.id === active.id);
    const newIndex = section.questions.findIndex(q => q.id === over.id);
    
    const reorderedQuestions = [...section.questions];
    const [removed] = reorderedQuestions.splice(oldIndex, 1);
    reorderedQuestions.splice(newIndex, 0, removed);
    
    // Update order values
    const updatedQuestions = reorderedQuestions.map((question, index) => ({
      ...question,
      order: index + 1,
    }));
    
    onReorderQuestions(updatedQuestions);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            <h3 className="font-medium text-gray-900">
              Section {sectionIndex + 1}: {section.title}
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            Delete Section
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Section Title"
                value={section.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter section title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Description
              </label>
              <textarea
                value={section.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter section description (optional)"
              />
            </div>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={section.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {section.questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    questionIndex={index}
                    onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                    onDelete={() => onDeleteQuestion(question.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          <Button
            variant="outline"
            icon={Plus}
            onClick={onAddQuestion}
            size="sm"
            className="mt-4"
          >
            Add Question
          </Button>
        </div>
      )}
    </div>
  );
}
