import { db } from './database';
import { Job, Candidate, Assessment, TimelineEvent } from '../types';

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Operations'];
const locations = ['Remote', 'San Francisco', 'New York', 'London', 'Berlin', 'Toronto'];
const jobTitles = [
  'Senior Software Engineer',
  'Product Manager',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'HR Specialist',
  'DevOps Engineer',
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'QA Engineer',
  'Technical Writer',
  'Customer Success Manager',
  'Business Analyst'
];

const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah',
  'Ian', 'Julia', 'Kevin', 'Luna', 'Michael', 'Nina', 'Oliver', 'Petra',
  'Quinn', 'Rachel', 'Samuel', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley'
];

const lastNames = [
  'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Foster', 'Garcia',
  'Harris', 'Johnson', 'King', 'Lee', 'Miller', 'Nelson', 'O\'Connor',
  'Parker', 'Quinn', 'Roberts', 'Smith', 'Taylor', 'Urban', 'Valdez',
  'Wilson', 'Young', 'Zhang', 'Martinez', 'Williams', 'Jones', 'Thompson'
];

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'] as const;

function createSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function seedDatabase() {
  // Clear existing data
  await Promise.all([
    db.jobs.clear(),
    db.candidates.clear(),
    db.assessments.clear(),
    db.responses.clear(),
    db.timeline.clear()
  ]);

  // Create jobs
  const jobs: Job[] = [];
  for (let i = 0; i < 25; i++) {
    const title = getRandomItem(jobTitles);
    const job: Job = {
      id: `job-${i + 1}`,
      title,
      slug: createSlug(title),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: getRandomItems(['Remote', 'Full-time', 'Part-time', 'Contract', 'Senior', 'Junior', 'Mid-level'], 2),
      order: i + 1,
      department: getRandomItem(departments),
      location: getRandomItem(locations),
      description: `We are looking for a talented ${title} to join our ${getRandomItem(departments)} team.`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    jobs.push(job);
  }
  
  await db.jobs.bulkAdd(jobs);

  // Create candidates
  const candidates: Candidate[] = [];
  const timelineEvents: TimelineEvent[] = [];
  
  for (let i = 0; i < 1000; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const jobId = getRandomItem(jobs).id;
    const stage = getRandomItem(stages);
    const appliedAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    const candidate: Candidate = {
      id: `candidate-${i + 1}`,
      name,
      email,
      stage,
      jobId,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      appliedAt,
      updatedAt: new Date(),
      notes: []
    };
    
    candidates.push(candidate);

    // Create timeline event for application
    timelineEvents.push({
      id: `timeline-${i + 1}`,
      candidateId: candidate.id,
      type: 'stage_change',
      description: 'Applied to position',
      newValue: 'applied',
      createdAt: appliedAt,
      author: 'System'
    });

    // Create additional timeline events for stage progression
    if (stage !== 'applied') {
      const stageIndex = stages.indexOf(stage);
      for (let j = 1; j <= stageIndex; j++) {
        timelineEvents.push({
          id: `timeline-${i + 1}-${j}`,
          candidateId: candidate.id,
          type: 'stage_change',
          description: `Moved to ${stages[j]} stage`,
          oldValue: stages[j - 1],
          newValue: stages[j],
          createdAt: new Date(appliedAt.getTime() + j * 24 * 60 * 60 * 1000),
          author: getRandomItem(['HR Team', 'John Smith', 'Sarah Johnson', 'Mike Wilson'])
        });
      }
    }
  }
  
  await db.candidates.bulkAdd(candidates);
  await db.timeline.bulkAdd(timelineEvents);

  // Create assessments
  const assessments: Assessment[] = [];
  const activeJobs = jobs.filter(job => job.status === 'active').slice(0, 3);
  
  for (const job of activeJobs) {
    const assessment: Assessment = {
      id: `assessment-${job.id}`,
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Technical assessment for ${job.title} position`,
      sections: [
        {
          id: `section-1-${job.id}`,
          title: 'General Questions',
          description: 'Basic questions about your background',
          order: 1,
          questions: [
            {
              id: `q1-${job.id}`,
              type: 'short-text',
              title: 'What interests you most about this position?',
              required: true,
              order: 1
            },
            {
              id: `q2-${job.id}`,
              type: 'single-choice',
              title: 'How many years of experience do you have?',
              required: true,
              options: ['0-1 years', '2-3 years', '4-5 years', '6+ years'],
              order: 2
            },
            {
              id: `q3-${job.id}`,
              type: 'long-text',
              title: 'Tell us about your most challenging project.',
              description: 'Please provide details about the project, your role, and the outcome.',
              required: true,
              validation: { maxLength: 1000 },
              order: 3,
              conditionalLogic: {
                showIf: {
                  questionId: `q2-${job.id}`,
                  operator: 'not-equals',
                  value: '0-1 years'
                }
              }
            }
          ]
        },
        {
          id: `section-2-${job.id}`,
          title: 'Technical Skills',
          description: 'Questions about your technical expertise',
          order: 2,
          questions: [
            {
              id: `q4-${job.id}`,
              type: 'multi-choice',
              title: 'Which programming languages are you proficient in?',
              required: true,
              options: ['JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby'],
              order: 1
            },
            {
              id: `q5-${job.id}`,
              type: 'numeric',
              title: 'Rate your overall technical skill level (1-10)',
              required: true,
              validation: { min: 1, max: 10 },
              order: 2
            },
            {
              id: `q6-${job.id}`,
              type: 'file-upload',
              title: 'Upload your resume or portfolio',
              required: false,
              order: 3
            }
          ]
        }
      ],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    
    assessments.push(assessment);
  }
  
  await db.assessments.bulkAdd(assessments);

  console.log('Database seeded successfully!');
}

export async function isDatabaseEmpty(): Promise<boolean> {
  const jobCount = await db.jobs.count();
  return jobCount === 0;
}
