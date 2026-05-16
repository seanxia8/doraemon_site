export const site = {
  name: 'DORAEMON',
  fullName: 'Open Dataset Challenge',
  title: 'DORAEMON | Open Dataset Challenge',
  description:
    'DORAEMON organizes public neutrino-detector datasets, shared AI tasks, baseline models, and notes from the Open Data Challenge program.',
  url: 'https://youngsam.github.io/doraemon_site',
  githubUrl: 'https://github.com/youngsam/doraemon_site',
  address: 'Stanford, California 94305',
};

export const navItems = [
  { href: '/challenges', label: 'OpenDC' },
  { href: '/data-hub', label: 'Data Hub' },
  { href: '/documentation/', label: 'Documentation' },
  { href: '/software', label: 'Software' },
  { href: '/updates', label: 'Updates' },
];

export const footerPages = [
  { href: '/challenges', label: 'OpenDC' },
  { href: '/data-hub', label: 'Data Hub' },
  { href: '/documentation/', label: 'Documentation' },
  { href: '/software', label: 'Software' },
];

export const footerMore = [
  { href: '/updates', label: 'Updates' },
  { href: '/documentation/challenge-reference.html', label: 'OpenDC Reference' },
  { href: '/documentation/metrics.html', label: 'Metrics' },
  { href: site.githubUrl, label: 'GitHub' },
];

export const homeHighlights = [
  {
    eyebrow: 'OpenDC',
    title: 'Panoptic segmentation',
    body: 'Active benchmark for particle-level LArTPC hit segmentation.',
    href: '/challenges/fm-panoptic-segmentation',
  },
  {
    eyebrow: 'Data',
    title: 'LArTPC FM v1',
    body: 'Planned simulated event records for foundation-model studies.',
    href: '/data-hub/lartpc-fm-v1',
  },
  {
    eyebrow: 'Docs',
    title: 'OpenDC reference',
    body: 'Task rules, metrics, dataset notes, and physics context.',
    href: '/documentation/',
  },
];

export const whyCards = [
  {
    number: '01',
    title: 'Same task, same metric.',
    body: 'Each OpenDC task states the input data, expected output, and score before submissions are compared.',
    accent: 'cardinal',
    icon: 'target',
  },
  {
    number: '02',
    title: 'Generic samples first.',
    body: 'Initial releases use public simulated datasets that preserve the detector problems without requiring private experiment samples.',
    accent: 'lagunita',
    icon: 'bars',
  },
  {
    number: '03',
    title: 'Lessons stay with the data.',
    body: 'Baselines, workshop notes, and examples should be added back to the Knowledge Hub.',
    accent: 'poppy',
    icon: 'book',
  },
];

export const buildCards = [
  {
    eyebrow: 'OpenDC',
    title: 'List the shared tasks.',
    body: 'Open Data Challenges define the dataset, task, metric, baseline, and submission format.',
    href: '/challenges',
    label: 'View OpenDC',
    accent: 'cardinal',
    icon: 'target',
  },
  {
    eyebrow: 'Data Hub',
    title: 'Describe each dataset plainly.',
    body: 'Dataset records say what detector sample they describe, how to access it, and which task uses it.',
    href: '/data-hub',
    label: 'Browse data',
    accent: 'palo',
    icon: 'bars',
  },
  {
    eyebrow: 'Documentation',
    title: 'Keep notes next to the work.',
    body: 'The docs collect rules, metrics, physics notes, software setup, and contribution guidance.',
    href: '/documentation/',
    label: 'Read docs',
    accent: 'lagunita',
    icon: 'book',
  },
  {
    eyebrow: 'Software',
    title: 'Point to usable code.',
    body: 'The software page lists model code, baselines, and data-loading utilities for OpenDC tasks.',
    href: '/software',
    label: 'See software',
    accent: 'poppy',
    icon: 'terminal',
  },
];

export const protocolModules = [
  {
    number: '01',
    title: 'Dataset',
    body: 'The record names the detector sample, format, access state, and schema notes.',
  },
  {
    number: '02',
    title: 'Task',
    body: 'The protocol states the input data, expected output, and evaluation split.',
  },
  {
    number: '03',
    title: 'Baseline',
    body: 'Reference solutions give participants a point of comparison before the leaderboard opens.',
  },
  {
    number: '04',
    title: 'Metric',
    body: 'Scores use common definitions so methods can be compared across submissions.',
  },
];

export const principles = [
  {
    number: '01',
    title: 'OpenDC',
    body: 'AI-ready datasets, shared tasks, common metrics, baselines, and public leaderboards.',
    accent: 'cardinal',
  },
  {
    number: '02',
    title: 'Knowledge Hub',
    body: 'Challenge datasets, trained models, examples, and lessons learned from reviews and workshops.',
    accent: 'lagunita',
  },
  {
    number: '03',
    title: 'Community Engagement',
    body: 'Schools, hands-on projects, and reusable materials for neutrino AI training.',
    accent: 'plum',
  },
];

export const communityCards = [
  {
    title: 'OpenDC protocol',
    body: 'Rules, metrics, and submission requirements for current and planned tasks.',
    href: '/documentation/challenge-reference.html',
    label: 'Open reference',
    accent: 'cardinal',
    icon: 'book',
  },
  {
    title: 'Dataset notes',
    body: 'Detector modality, format, schema notes, and access status for OpenDC datasets.',
    href: '/data-hub',
    label: 'View data hub',
    accent: 'palo',
    icon: 'bars',
  },
  {
    title: 'Contribution path',
    body: 'How to propose datasets, tasks, baselines, examples, and validation improvements.',
    href: '/documentation/contributing.html',
    label: 'Contribute',
    accent: 'lagunita',
    icon: 'chat',
  },
];

export const models = ['U-ResNet', 'SparseFormer', 'PointMamba', 'DINO-LAr', 'Mask3D', 'DORAEMON'];

export const questions = [
  'semantic',
  'instance',
  'grouping',
  'completion',
  'transfer',
  'calibration',
  'schema',
  'runtime',
];
