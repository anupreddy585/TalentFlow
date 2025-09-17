import Dexie, { Table } from 'dexie';
import { Job, Candidate, Assessment, AssessmentResponse, TimelineEvent } from '../types';

export class TalentFlowDatabase extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  responses!: Table<AssessmentResponse>;
  timeline!: Table<TimelineEvent>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: '++id, title, slug, status, order, createdAt',
      candidates: '++id, name, email, stage, jobId, appliedAt',
      assessments: '++id, jobId, title, createdAt',
      responses: '++id, candidateId, assessmentId, submittedAt',
      timeline: '++id, candidateId, type, createdAt'
    });
  }
}

export const db = new TalentFlowDatabase();
