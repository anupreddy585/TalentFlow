import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Job } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  status: z.enum(['active', 'archived']),
  department: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface JobFormProps {
  job?: Job;
  onSubmit: (data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function JobForm({ job, onSubmit, onCancel, loading }: JobFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      slug: job?.slug || '',
      status: job?.status || 'active',
      department: job?.department || '',
      location: job?.location || '',
      description: job?.description || '',
      tags: job?.tags.join(', ') || '',
    },
  });

  const titleValue = watch('title');

  // Auto-generate slug from title
  React.useEffect(() => {
    if (titleValue && !job) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [titleValue, setValue, job]);

  const handleFormSubmit = async (data: JobFormData) => {
    const tags = data.tags
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const jobData = {
      title: data.title,
      slug: data.slug,
      status: data.status,
      department: data.department || undefined,
      location: data.location || undefined,
      description: data.description || undefined,
      tags,
      order: job?.order || 0,
    };

    await onSubmit(jobData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Job Title"
          {...register('title')}
          error={errors.title?.message}
          required
        />
        
        <Input
          label="URL Slug"
          {...register('slug')}
          error={errors.slug?.message}
          helperText="Used in job URL (e.g., /jobs/senior-engineer)"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Status"
          {...register('status')}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
          required
        />
        
        <Input
          label="Department"
          {...register('department')}
          error={errors.department?.message}
          placeholder="e.g., Engineering"
        />
        
        <Input
          label="Location"
          {...register('location')}
          error={errors.location?.message}
          placeholder="e.g., Remote, San Francisco"
        />
      </div>

      <Input
        label="Tags"
        {...register('tags')}
        error={errors.tags?.message}
        placeholder="Remote, Full-time, Senior"
        helperText="Separate tags with commas"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Job description and requirements..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {job ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  );
}
