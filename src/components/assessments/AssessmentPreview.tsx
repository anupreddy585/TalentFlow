import React, { useState } from 'react';
import { Assessment, Question } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface AssessmentPreviewProps {
  assessment: Assessment;
}

export function AssessmentPreview({ assessment }: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  const validateResponse = (question: Question, value: any): string | null => {
    if (question.required && (!value || value === '')) {
      return 'This field is required';
    }

    if (question.type === 'numeric' && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
      if (question.validation?.min !== undefined && numValue < question.validation.min) {
        return `Value must be at least ${question.validation.min}`;
      }
      if (question.validation?.max !== undefined && numValue > question.validation.max) {
        return `Value must be at most ${question.validation.max}`;
      }
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && value) {
      if (question.validation?.maxLength && value.length > question.validation.maxLength) {
        return `Text must be no more than ${question.validation.maxLength} characters`;
      }
    }

    return null;
  };

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.conditionalLogic) return true;
    
    const { showIf } = question.conditionalLogic;
    const dependentValue = responses[showIf.questionId];
    
    switch (showIf.operator) {
      case 'equals':
        return dependentValue === showIf.value;
      case 'not-equals':
        return dependentValue !== showIf.value;
      case 'contains':
        return Array.isArray(dependentValue) 
          ? dependentValue.includes(showIf.value)
          : String(dependentValue || '').includes(showIf.value);
      default:
        return true;
    }
  };

  const renderQuestion = (question: Question) => {
    if (!isQuestionVisible(question)) return null;

    const value = responses[question.id] || '';
    const error = errors[question.id];

    switch (question.type) {
      case 'short-text':
        return (
          <Input
            key={question.id}
            label={question.title}
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            error={error}
            helperText={question.description}
            required={question.required}
            maxLength={question.validation?.maxLength}
          />
        );

      case 'long-text':
        return (
          <div key={question.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            <textarea
              value={value}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              rows={4}
              maxLength={question.validation?.maxLength}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : ''
              }`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'numeric':
        return (
          <Input
            key={question.id}
            type="number"
            label={question.title}
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            error={error}
            helperText={question.description}
            required={question.required}
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      case 'single-choice':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'multi-choice':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleResponseChange(question.id, newValues);
                    }}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'file-upload':
        return (
          <div key={question.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {question.title}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.description && (
              <p className="text-sm text-gray-500">{question.description}</p>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={(e) => handleResponseChange(question.id, e.target.files?.[0])}
                className="hidden"
                id={`file-${question.id}`}
              />
              <label
                htmlFor={`file-${question.id}`}
                className="cursor-pointer text-blue-600 hover:text-blue-700"
              >
                Click to upload file
              </label>
              {value && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {value.name || 'File selected'}
                </p>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (isQuestionVisible(question)) {
          const value = responses[question.id];
          const error = validateResponse(question, value);
          if (error) {
            newErrors[question.id] = error;
          }
        }
      });
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert('Assessment submitted successfully! (This is just a preview)');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Preview</h3>
        <p className="text-sm text-gray-600">This is how candidates will see the assessment</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{assessment.title}</h2>
          {assessment.description && (
            <p className="text-gray-600">{assessment.description}</p>
          )}
        </div>

        <form className="space-y-8">
          {assessment.sections.map((section) => (
            <div key={section.id} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                )}
              </div>
              
              <div className="space-y-6">
                {section.questions
                  .sort((a, b) => a.order - b.order)
                  .map(renderQuestion)
                  .filter(Boolean)}
              </div>
            </div>
          ))}
          
          <div className="pt-6 border-t border-gray-200">
            <Button onClick={handleSubmit} type="button">
              Submit Assessment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
