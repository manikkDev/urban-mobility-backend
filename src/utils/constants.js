const SCHEME_CATEGORIES = [
  'escalator_access',
  'lift_access',
  'ramp_access',
  'accessible_road',
  'footpath_access',
  'tactile_navigation',
  'pedestrian_crossing',
  'public_toilet_access',
  'public_entry_access',
  'mixed_accessibility',
];

const ISSUE_CATEGORIES = [
  'equipment_failure',
  'road_access',
  'pathway_blockage',
  'partial_implementation',
  'official_neglect',
  'safety_risk',
  'signage_problem',
  'other',
];

const ISSUE_TYPES = [
  'broken_escalator',
  'lift_not_working',
  'damaged_ramp',
  'inaccessible_road',
  'blocked_footpath',
  'missing_tactile_path',
  'unsafe_crossing',
  'signage_missing',
  'scheme_not_started',
  'partial_implementation',
  'ignored_by_officials',
  'scheme_non_functional',
  'other',
];

const SCHEME_CONDITIONS = [
  'working',
  'partially_working',
  'not_working',
  'ignored',
  'unverified',
];

const OFFICIAL_STATUSES = [
  'announced',
  'sanctioned',
  'in_progress',
  'completed',
];

const PUBLIC_STATUSES = [
  'working',
  'partially_working',
  'not_working',
  'ignored',
  'unverified',
];

const STATUS_COLOR_MAP = {
  working: 'green',
  partially_working: 'yellow',
  not_working: 'red',
  ignored: 'red',
  unverified: 'gray',
};

const SEVERITY_LEVELS = [1, 2, 3, 4, 5];

const REVIEW_STATUSES = ['new', 'under_review', 'resolved', 'dismissed'];

module.exports = {
  SCHEME_CATEGORIES,
  ISSUE_CATEGORIES,
  ISSUE_TYPES,
  SCHEME_CONDITIONS,
  OFFICIAL_STATUSES,
  PUBLIC_STATUSES,
  STATUS_COLOR_MAP,
  SEVERITY_LEVELS,
  REVIEW_STATUSES,
};
