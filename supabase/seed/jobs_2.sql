-- More sample job postings: 7 published jobs, all shown on the careers
-- pages. Same shape as seed/jobs.sql; run it in the Supabase SQL editor
-- after every migration. Safe to re-run: a title that already exists is
-- skipped. Job codes, slugs and posted_at are filled in by the database.

insert into public.jobs (
    title, department, location, mode_of_work, type_of_work, experience_level,
    min_experience_years, about_job, responsibilities, qualifications, notes,
    skills, vacancies, status, closes_on
)
select v.*
from (values
    (
        'Product Manager', 'Product', 'Chennai, India', 'Hybrid', 'Full-time', 'Experienced',
        4::smallint,
        'Own the roadmap for one of our client-facing products, from discovery and planning through launch and iteration.',
        array['Define the product roadmap with business and engineering leads',
              'Write clear requirements and user stories',
              'Prioritise the backlog and run sprint planning',
              'Track product metrics and share results with stakeholders'],
        array['Bachelor''s degree in Engineering, Business or a related field',
              '4+ years in product management for software products'],
        array['Hybrid: 2 days a week in the Chennai office'],
        array['Product Strategy', 'Agile', 'Jira', 'Analytics'],
        1, 'published'::public.job_status, date '2027-01-20'
    ),
    (
        'QA Automation Engineer', 'Engineering', 'Puducherry, India', 'On-site', 'Full-time', 'Experienced',
        2::smallint,
        'Keep our releases reliable by building automated test suites and working with developers to catch issues early.',
        array['Write and maintain automated UI and API tests',
              'Add tests to the CI pipeline and keep them fast and stable',
              'Report, track and verify bugs with the development team'],
        array['Bachelor''s degree in Computer Science or IT',
              '2+ years of test automation experience'],
        array[]::text[],
        array['Playwright', 'Selenium', 'API Testing', 'JavaScript'],
        2, 'published'::public.job_status, date '2026-12-31'
    ),
    (
        'DevOps Engineer', 'Engineering', 'Remote, India', 'Remote', 'Full-time', 'Experienced',
        3::smallint,
        'Build and run the cloud infrastructure, deployment pipelines and monitoring that keep our products online.',
        array['Manage cloud infrastructure with infrastructure-as-code',
              'Build and maintain CI/CD pipelines',
              'Set up monitoring, alerts and on-call runbooks',
              'Improve security and cost across environments'],
        array['Bachelor''s degree in Computer Science or a related field',
              '3+ years in DevOps or site reliability roles'],
        array['Fully remote within India; occasional travel for team meetups'],
        array['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
        1, 'published'::public.job_status, date '2027-01-31'
    ),
    (
        'Accounts Executive', 'Finance', 'Puducherry, India', 'On-site', 'Full-time', 'Experienced',
        1::smallint,
        'Handle day-to-day accounting, invoicing and compliance, and help the finance team close the books each month.',
        array['Record transactions and reconcile bank statements',
              'Prepare invoices and follow up on payments',
              'Support GST and TDS filings',
              'Help with month-end closing and reports'],
        array['B.Com or M.Com degree',
              '1+ year of accounting experience'],
        array[]::text[],
        array['Tally', 'GST', 'MS Excel', 'Accounting'],
        1, 'published'::public.job_status, date '2026-12-20'
    ),
    (
        'Graphic Designer', 'Design', 'Puducherry, India', 'On-site', 'Full-time', 'Fresher',
        null::smallint,
        'Create visuals for our brand, marketing campaigns and social media that look sharp and stay on brand.',
        array['Design social media posts, banners and brochures',
              'Prepare visuals for marketing campaigns',
              'Keep all designs consistent with brand guidelines'],
        array['Degree or diploma in Graphic Design or Visual Arts',
              'A portfolio of design work'],
        array['Please include a link to your portfolio with your application'],
        array['Adobe Photoshop', 'Adobe Illustrator', 'Canva', 'Typography'],
        1, 'published'::public.job_status, date '2026-12-15'
    ),
    (
        'Operations Coordinator', 'Operations', 'Chennai, India', 'On-site', 'Full-time', 'Fresher',
        null::smallint,
        'Keep the office and day-to-day operations running smoothly, from vendors and assets to travel and team logistics.',
        array['Coordinate with vendors and track purchase orders',
              'Maintain the asset register and office supplies',
              'Arrange travel and logistics for team members',
              'Prepare simple operations reports'],
        array['Bachelor''s degree in any discipline',
              'Good written and spoken English'],
        array[]::text[],
        array['Coordination', 'MS Office', 'Communication', 'Vendor Management'],
        1, 'published'::public.job_status, date '2027-01-10'
    ),
    (
        'Inside Sales Executive', 'Sales', 'Puducherry, India', 'On-site', 'Full-time', 'Fresher',
        null::smallint,
        'Reach out to potential clients, explain our services and set up meetings for the business development team.',
        array['Call and email leads to introduce our services',
              'Qualify leads and book meetings for senior sales staff',
              'Keep lead and deal details up to date in the CRM'],
        array['Bachelor''s degree in any discipline',
              'Confident communication in English; Tamil is a plus'],
        array['Fixed salary plus monthly incentives'],
        array['Cold Calling', 'CRM', 'Communication', 'Lead Generation'],
        3, 'published'::public.job_status, date '2026-12-31'
    )
) as v (
    title, department, location, mode_of_work, type_of_work, experience_level,
    min_experience_years, about_job, responsibilities, qualifications, notes,
    skills, vacancies, status, closes_on
)
where not exists (select 1 from public.jobs j where j.title = v.title);
