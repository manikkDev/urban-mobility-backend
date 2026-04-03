const RAILWAY_SCHEME_CATEGORIES = [
  'lift_access',
  'escalator_access',
  'ramp_access',
  'platform_access',
  'foot_over_bridge_access',
  'tactile_navigation',
  'wheelchair_support',
  'disability_assistance',
  'accessible_toilet_access',
  'station_entry_access',
];

const RAILWAY_ISSUE_CATEGORIES = [
  'equipment_failure',
  'platform_access_problem',
  'pathway_blockage',
  'partial_implementation',
  'official_neglect',
  'safety_risk',
  'signage_problem',
  'assistance_unavailable',
  'other',
];

const RAILWAY_ISSUE_TYPES = [
  'broken_escalator',
  'lift_not_working',
  'damaged_ramp',
  'inaccessible_platform',
  'blocked_wheelchair_access',
  'missing_tactile_path',
  'unsafe_foot_over_bridge',
  'assistance_counter_unavailable',
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

const STATUS_COLORS = [
  'green',
  'yellow',
  'red',
  'gray',
];

const SEVERITY_LEVELS = [1, 2, 3, 4, 5];

const REVIEW_STATUSES = ['new', 'reviewing', 'verified', 'resolved', 'rejected'];

const ESCALATION_STATUSES = ['not_started', 'escalated', 'acknowledged', 'resolved'];

module.exports = {
  RAILWAY_SCHEME_CATEGORIES,
  RAILWAY_ISSUE_CATEGORIES,
  RAILWAY_ISSUE_TYPES,
  SCHEME_CONDITIONS,
  OFFICIAL_STATUSES,
  PUBLIC_STATUSES,
  STATUS_COLORS,
  SEVERITY_LEVELS,
  REVIEW_STATUSES,
  ESCALATION_STATUSES,
};
