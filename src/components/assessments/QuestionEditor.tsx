import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, X } from 'lucide-react';
import { Question } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface QuestionEditorProps {
  question: Question;
  questionIndex: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

const questionTypes = [
  { value: 'single-choice', label: 'Single Choice' },
  { value: 'multi-choice', label: 'Multiple Choice' },
  { value: 'short-text', label: 'Short Text' },
  { value: 'long-text', label: 'Long Text' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'file-upload', label: 'File Upload' },
];

export function QuestionEditor({ question, questionIndex, onUpdate, onDelete }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddOption = () => {
    const options = question.options || [];
    onUpdate({ options: [...options, ''] });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const options = [...(question.options || [])];
    options[index] = value;
    onUpdate({ options });
  };

  const handleRemoveOption = (index: number) => {
    const options = [...(question.options || [])];
    options.splice(index, 1);
    onUpdate({ options });
  };

  const showOptions = question.type === 'single-choice' || question.type === 'multi-choice';
  const showValidation = question.type === 'numeric' || question.type === 'short-text' || question.type === 'long-text';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-50 border border-gray-200 rounded-lg"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Question {questionIndex + 1}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-900 font-medium">{question.title || 'Untitled Question'}</p>
          <p className="text-xs text-gray-500 capitalize">{question.type.replace('-', ' ')}</p>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Question Type"
              value={question.type}
              onChange={(e) => onUpdate({ type: e.target.value as Question['type'] })}
              options={questionTypes}
            />
            
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Required</span>
              </label>
            </div>
          </div>
          
          <Input
            label="Question Title"
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter your question"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={question.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add additional context or instructions"
            />
          </div>
          
          {showOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Answer Options
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddOption}
                >
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {(question.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showValidation && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Validation</h4>
              <div className="grid grid-cols-2 gap-4">
                {question.type === 'numeric' && (
                  <>
                    <Input
                      label="Minimum Value"
                      type="number"
                      value={question.validation?.min || ''}
                      onChange={(e) => onUpdate({
                        validation: {
                          ...question.validation,
                          min: e.target.value ? parseInt(e.target.value) : undefined,
                        }
                      })}
                    />
                    <Input
                      label="Maximum Value"
                      type="number"
                      value={question.validation?.max || ''}
                      onChange={(e) => onUpdate({
                        validation: {
                          ...question.validation,
                          max: e.target.value ? parseInt(e.target.value) : undefined,
                        }
                      })}
                    />
                  </>
                )}
                
                {(question.type === 'short-text' || question.type === 'long-text') && (
                  <Input
                    label="Maximum Length"
                    type="number"
                    value={question.validation?.maxLength || ''}
                    onChange={(e) => onUpdate({
                      validation: {
                        ...question.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                      }
                    })}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
