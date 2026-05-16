import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { LibraryTabs } from './LibraryTabs';

export const metadata: Metadata = {
  title: 'Materials Library',
  description:
    'Hidden template for a course-materials library with textbook, lecture, reading, and outcome sections.',
};

const textbookLinks = [
  { label: 'Open textbook', href: '#textbook', variant: 'primary' },
  { label: 'Full syllabus', href: '#outcomes', variant: 'ghost' },
];

const lectureArcs = [
  {
    title: 'Arc 1: Detector Data as Predictive Modeling',
    items: [
      {
        number: 'L1',
        date: 'March 30, 2026',
        kind: 'Lecture',
        title: 'Introduction + Foundations',
        links: ['Lecture 1 slides', 'Lecture 1 video', 'Chapter 1', 'Reference reading'],
      },
      {
        number: 'L2',
        date: 'April 1, 2026',
        kind: 'Lecture',
        title:
          'Probabilistic Models I: sparse detector records, item-wise data, and pairwise comparisons',
        links: ['Lecture 2 slides', 'Lecture 2 video', 'Chapter 2', 'Modeling notes'],
      },
      {
        date: 'April 3, 2026',
        kind: 'Discussion',
        title: 'Hands-on tutorial on event records and predictive modeling',
        links: ['Discussion 1 notebook'],
      },
      {
        number: 'L3',
        date: 'April 6, 2026',
        kind: 'Lecture',
        title: 'Probabilistic Models II: inference, validation, and uncertainty',
        links: ['Lecture 3 slides', 'Lecture 3 video', 'Chapter 3', 'Inference reading'],
      },
    ],
  },
  {
    title: 'Arc 2: Reliability, Validity, and Evaluation Design',
    items: [
      {
        number: 'L4',
        date: 'April 8, 2026',
        kind: 'Lecture',
        title: 'Reliability I: signal, noise, and uncertainty in shared benchmarks',
        links: ['Lecture 4 slides', 'Lecture 4 video', 'Reliability notes'],
      },
      {
        date: 'April 10, 2026',
        kind: 'Discussion',
        title: 'Hands-on tutorial on metrics and diagnostic plots',
        links: ['Discussion 2 notebook'],
      },
      {
        number: 'L5',
        date: 'April 13, 2026',
        kind: 'Lecture',
        title: 'Validity: connecting benchmark scores to scientific use',
        links: ['Lecture 5 slides', 'Lecture 5 video', 'Chapter 4', 'Validity reading'],
      },
      {
        number: 'L6',
        date: 'April 15, 2026',
        kind: 'Lecture',
        title: 'Evaluation Design: baselines, splits, and submission rules',
        links: ['Lecture 6 slides', 'Lecture 6 video', 'Design worksheet'],
      },
    ],
  },
];

const readings = [
  {
    theme: 'Defining Constructs + Validity',
    items: [
      'Construct validity for scientific AI benchmarks',
      'Measurement notes for detector representation learning',
      'Evaluation claims and intended-use statements',
    ],
  },
  {
    theme: 'Predictive Modeling + Scoring',
    items: [
      'Sparse-event modeling primer',
      'Masked reconstruction objectives',
      'Shared leaderboard metrics and uncertainty reports',
    ],
  },
  {
    theme: 'Reliability + Governance',
    items: [
      'Split design and benchmark stability',
      'Submission auditing checklist',
      'Dataset documentation and reproducibility notes',
    ],
  },
];

const outcomes = [
  'Connect course readings to the shared dataset and benchmark record.',
  'Find slides, recordings, notebooks, and chapters by lecture.',
  'Browse readings by theme without exposing the page in public navigation.',
];

function MaterialChip({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'slides' | 'video' | 'book' | 'default';
}) {
  const icon = tone === 'video' ? 'chalkboard' : tone === 'book' ? 'book' : 'ruler';
  return (
    <a className={`library-chip library-chip-${tone}`} href="#">
      <Icon name={icon} size={14} />
      <span>{label}</span>
    </a>
  );
}

export default function CourseMaterialsLibraryPage() {
  return (
    <>
      <section className="library-hero">
        <div className="container library-hero-inner">
          <p className="eyebrow">Materials library</p>
          <h1>Textbook, lectures, and readings.</h1>
          <p>
            Everything for the course in one place. Find materials by lecture or
            browse the thematic reading list.
          </p>
        </div>
      </section>

      <LibraryTabs />

      <section className="library-section" id="textbook">
        <div className="container">
          <article className="library-feature-panel panel">
            <div className="library-feature-copy">
              <h2>
                <Icon name="book" size={21} />
                <span>Course Textbook</span>
              </h2>
              <p>
                The course textbook covers measurement theory, probabilistic
                models, reliability, validity, and evaluation design. Chapter
                references appear in the lecture cards below.
              </p>
            </div>
            <div className="library-feature-actions">
              {textbookLinks.map((link) => (
                <a
                  className={`library-action library-action-${link.variant}`}
                  href={link.href}
                  key={link.label}
                >
                  {link.label}
                  {link.variant === 'ghost' ? <Icon name="arrow" size={14} /> : null}
                </a>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="library-section library-lectures" id="lectures">
        <div className="container">
          <h2 className="library-section-title">Lecture materials</h2>
          <div className="library-arc-stack">
            {lectureArcs.map((arc) => (
              <section className="library-arc" key={arc.title}>
                <h3>{arc.title}</h3>
                <div className="library-card-stack">
                  {arc.items.map((item) => (
                    <article className="library-lecture-card panel" key={`${item.date}-${item.title}`}>
                      <div className="library-lecture-meta">
                        {item.number ? <strong>{item.number}</strong> : null}
                        <span>{item.date}</span>
                        <span className="library-kind-pill">{item.kind}</span>
                      </div>
                      <h4>{item.title}</h4>
                      <div className="library-chip-row">
                        {item.links.map((label) => (
                          <MaterialChip
                            key={label}
                            label={label}
                            tone={
                              label.includes('slides')
                                ? 'slides'
                                : label.includes('video')
                                  ? 'video'
                                  : label.includes('Chapter') || label.includes('notes')
                                    ? 'book'
                                    : 'default'
                            }
                          />
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="library-section library-reading-band" id="readings">
        <div className="container">
          <div className="library-reading-heading">
            <p className="eyebrow">Reading list</p>
            <h2 className="library-section-title">Readings by theme</h2>
          </div>
          <div className="library-reading-grid">
            {readings.map((group) => (
              <article className="library-reading-card panel" key={group.theme}>
                <h3>{group.theme}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>
                      <a href="#">
                        <Icon name="book" size={15} />
                        <span>{item}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="library-section" id="outcomes">
        <div className="container library-outcomes">
          <div>
            <p className="eyebrow">Outcomes</p>
            <h2 className="library-section-title">Learning outcomes</h2>
          </div>
          <div className="library-outcome-grid">
            {outcomes.map((outcome, index) => (
              <article className="library-outcome-card panel" key={outcome}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{outcome}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
