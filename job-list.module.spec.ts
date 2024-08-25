import { JobListModule } from './job-list.module';

describe('JobListModule', () => {
  let jobListModule: JobListModule;

  beforeEach(() => {
    jobListModule = new JobListModule();
  });

  it('should create an instance', () => {
    expect(jobListModule).toBeTruthy();
  });
});
