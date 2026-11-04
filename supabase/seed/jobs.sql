-- Sample job postings for local testing: 6 published (shown on the careers
-- pages) and 1 draft (only HR sees it in Job Openings). Run in the Supabase
-- SQL editor after every migration. Safe to re-run: a title that already
-- exists is skipped. Job codes, slugs and posted_at are filled in by the
-- database.

insert into public.jobs (
    title, department, location, mode_of_work, type_of_work, experience_level,
    min_experience_years, about_job, responsibilities, qualifications, notes,
    skills, vacancies, status, closes_on
)
select v.*
from (values
    (
        'Frontend Developer', 'Engineering', 'Puducherry, India', 'Hybrid', 'Full-time', 'Experienced',
        2::smallint,
        'Build fast, accessible web apps for our clients using React and Next.js, working closely with designers and backend engineers.',
        array['Build responsive UI components in React and Next.js',
              'Turn Figma designs into pixel-accurate, accessible pages',
              'Review pull requests and keep the codebase clean',
              'Work with backend engineers to integrate REST APIs'],
        array['Bachelor''s degree in Computer Science or related field',
              '2+ years building production React applications'],
        array['Hybrid: 3 days a week in the Puducherry office'],
        array['React', 'Next.js', 'JavaScript', 'Tailwind CSS'],
        2, 'published'::public.job_status, date '2026-12-31'
    ),
    (
        'Backend Developer (Node.js)', 'Engineering', 'Chennai, India', 'On-site', 'Full-time', 'Experienced',
        3::smallint,
        'Design and run the APIs and databases behind our products, with a focus on reliability, security and performance.',
        array['Design and build REST APIs in Node.js',
              'Model data and write efficient PostgreSQL queries',
              'Write automated tests and monitor services in production'],
        array['Bachelor''s degree in Computer Science or related field',
              '3+ years of backend development experience'],
        array[]::text[],
        array['Node.js', 'PostgreSQL', 'REST APIs', 'Docker'],
        1, 'published'::public.job_status, date '2027-01-15'
    ),
    (
        'UI/UX Designer', 'Design', 'Puducherry, India', 'On-site', 'Full-time', 'Fresher',
        null::smallint,
        'Shape how people use our products, from early research and wireframes to polished interfaces and design systems.',
        array['Create wireframes, prototypes and final UI in Figma',
              'Run user interviews and usability tests',
              'Maintain and grow the shared design system'],
        array['Degree or diploma in Design or a related field',
              'A portfolio showing UI or UX work'],
        array['Please include a link to your portfolio with your application'],
        array['Figma', 'Prototyping', 'User Research'],
        1, 'published'::public.job_status, date '2026-12-20'
    ),
    (
        'HR Executive', 'Human Resources', 'Puducherry, India', 'On-site', 'Full-time', 'Experienced',
        1::smallint,
        'Support hiring, onboarding and employee engagement across the company, and keep HR records accurate and up to date.',
        array['Screen candidates and schedule interviews',
              'Run onboarding for new joiners',
              'Maintain employee records and HR documents',
              'Plan employee engagement activities'],
        array['MBA in HR or equivalent degree',
              '1+ year of experience in recruitment or HR operations'],
        array[]::text[],
        array['Recruitment', 'Onboarding', 'MS Excel', 'Communication'],
        1, 'published'::public.job_status, date '2026-12-15'
    ),
    (
        'Digital Marketing Executive', 'Marketing', 'Remote, India', 'Remote', 'Contract', 'Experienced',
        2::smallint,
        'Plan and run campaigns that grow our brand and bring in leads across search, social and email.',
        array['Plan and run SEO, social media and email campaigns',
              'Track campaign results and report on key metrics',
              'Write and schedule content with the design team'],
        array['Bachelor''s degree in Marketing or a related field',
              '2+ years running digital campaigns'],
        array['6-month contract, with the option to extend'],
        array['SEO', 'Google Analytics', 'Social Media', 'Content Writing'],
        1, 'published'::public.job_status, date '2027-01-31'
    ),
    (
        'Software Engineering Intern', 'Engineering', 'Puducherry, India', 'On-site', 'Internship', 'Fresher',
        null::smallint,
        'Learn by shipping real features alongside our engineering team during a six-month paid internship.',
        array['Build and fix features under the guidance of a mentor',
              'Write tests and documentation for your work',
              'Take part in code reviews and team stand-ups'],
        array['Final-year student or recent graduate in Computer Science or IT',
              'Basic knowledge of JavaScript or Python'],
        array['Paid internship with a chance of a full-time offer',
              'Duration: 6 months'],
        array['JavaScript', 'Python', 'Git'],
        4, 'published'::public.job_status, date '2026-12-10'
    ),
    (
        'Business Development Manager', 'Sales', 'Chennai, India', 'Hybrid', 'Full-time', 'Experienced',
        5::smallint,
        'Find and win new clients for our technology services, and grow long-term relationships with existing accounts.',
        array['Find and qualify new business opportunities',
              'Prepare proposals and lead client meetings',
              'Hit quarterly revenue targets'],
        array['MBA or Bachelor''s degree in Business or a related field',
              '5+ years in B2B sales for IT services'],
        array[]::text[],
        array['B2B Sales', 'Negotiation', 'CRM', 'Lead Generation'],
        1, 'draft'::public.job_status, date '2027-02-28'
    )
) as v (
    title, department, location, mode_of_work, type_of_work, experience_level,
    min_experience_years, about_job, responsibilities, qualifications, notes,
    skills, vacancies, status, closes_on
)
where not exists (select 1 from public.jobs j where j.title = v.title);
