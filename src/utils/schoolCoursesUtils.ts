import type { RoleDefinition } from '../types';

/**
 * Course interface for school courses
 */
export interface SchoolCourse {
  name: string;
  code: string;
  description: string;
  url?: string;
}

/**
 * Get recommended courses from a school based on role
 * This is a placeholder - in production, you'd fetch from school APIs or databases
 */
export function getSchoolCourses(school: string, role: RoleDefinition): SchoolCourse[] {
  // This is a simplified implementation
  // In production, you'd have a database or API that maps schools to their course catalogs
  
  const commonCourses: Record<string, SchoolCourse[]> = {
    'web developers': [
      {
        name: 'Introduction to Web Development',
        code: 'CS 101',
        description: 'Learn HTML, CSS, and JavaScript fundamentals',
      },
      {
        name: 'Frontend Frameworks',
        code: 'CS 201',
        description: 'Learn React, Vue, or Angular',
      },
      {
        name: 'Database Systems',
        code: 'CS 301',
        description: 'Introduction to SQL and database design',
      },
    ],
    'software developers': [
      {
        name: 'Introduction to Programming',
        code: 'CS 101',
        description: 'Learn programming fundamentals',
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS 201',
        description: 'Learn core computer science concepts',
      },
      {
        name: 'Software Engineering',
        code: 'CS 301',
        description: 'Learn software development practices',
      },
    ],
    'data analysts': [
      {
        name: 'Introduction to Data Science',
        code: 'DS 101',
        description: 'Learn data analysis fundamentals',
      },
      {
        name: 'Statistics for Data Science',
        code: 'DS 201',
        description: 'Statistical methods for data analysis',
      },
      {
        name: 'Data Visualization',
        code: 'DS 301',
        description: 'Create compelling data visualizations',
      },
    ],
  };

  // Map role to course category
  const roleMap: Record<string, string> = {
    'junior-web-dev': 'web developers',
    'frontend-dev': 'web developers',
    'backend-dev': 'software developers',
    'fullstack-dev': 'software developers',
    'python-dev': 'software developers',
    'data-analyst': 'data analysts',
    'devops-engineer': 'software developers',
    'database-admin': 'software developers',
  };

  const courseCategory = roleMap[role.id] || 'software developers';
  const courses = commonCourses[courseCategory] || [];

  // Add school-specific note
  return courses.map(course => ({
    ...course,
    description: `${course.description} (Check ${school} course catalog for exact course codes)`,
  }));
}

