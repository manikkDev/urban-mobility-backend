const { ISSUE_TYPES, ISSUE_CATEGORIES } = require('../utils/constants');

const issueTypeToCategory = {
  broken_escalator: 'equipment_failure',
  lift_not_working: 'equipment_failure',
  damaged_ramp: 'equipment_failure',
  inaccessible_road: 'road_access',
  blocked_footpath: 'pathway_blockage',
  missing_tactile_path: 'pathway_blockage',
  unsafe_crossing: 'safety_risk',
  signage_missing: 'signage_problem',
  scheme_not_started: 'official_neglect',
  partial_implementation: 'partial_implementation',
  ignored_by_officials: 'official_neglect',
  scheme_non_functional: 'equipment_failure',
  other: 'other',
};

const issueTypeToCondition = {
  broken_escalator: 'not_working',
  lift_not_working: 'not_working',
  damaged_ramp: 'not_working',
  inaccessible_road: 'not_working',
  blocked_footpath: 'partially_working',
  missing_tactile_path: 'not_working',
  unsafe_crossing: 'partially_working',
  signage_missing: 'partially_working',
  scheme_not_started: 'ignored',
  partial_implementation: 'partially_working',
  ignored_by_officials: 'ignored',
  scheme_non_functional: 'not_working',
  other: 'partially_working',
};

const classifyReport = (description, providedIssueType = null) => {
  if (providedIssueType && ISSUE_TYPES.includes(providedIssueType)) {
    return {
      issueType: providedIssueType,
      issueCategory: issueTypeToCategory[providedIssueType] || 'other',
      schemeCondition: issueTypeToCondition[providedIssueType] || 'partially_working',
      classifiedBy: 'user_selected',
    };
  }

  const desc = description.toLowerCase();

  if (desc.includes('escalator') && (desc.includes('broken') || desc.includes('stopped') || desc.includes('not working') || desc.includes('non-functional'))) {
    return { issueType: 'broken_escalator', issueCategory: 'equipment_failure', schemeCondition: 'not_working', classifiedBy: 'rule_engine' };
  }

  if ((desc.includes('lift') || desc.includes('elevator')) && (desc.includes('stuck') || desc.includes('broken') || desc.includes('not working') || desc.includes('out of order'))) {
    return { issueType: 'lift_not_working', issueCategory: 'equipment_failure', schemeCondition: 'not_working', classifiedBy: 'rule_engine' };
  }

  if (desc.includes('ramp') && (desc.includes('broken') || desc.includes('damaged') || desc.includes('cracked') || desc.includes('unusable'))) {
    return { issueType: 'damaged_ramp', issueCategory: 'equipment_failure', schemeCondition: 'not_working', classifiedBy: 'rule_engine' };
  }

  if ((desc.includes('road') || desc.includes('street')) && (desc.includes('wheelchair') || desc.includes('inaccessible') || desc.includes('no access'))) {
    return { issueType: 'inaccessible_road', issueCategory: 'road_access', schemeCondition: 'not_working', classifiedBy: 'rule_engine' };
  }

  if ((desc.includes('footpath') || desc.includes('sidewalk') || desc.includes('path')) && (desc.includes('blocked') || desc.includes('obstruct') || desc.includes('encroach'))) {
    return { issueType: 'blocked_footpath', issueCategory: 'pathway_blockage', schemeCondition: 'partially_working', classifiedBy: 'rule_engine' };
  }

  if (desc.includes('tactile') && (desc.includes('missing') || desc.includes('no tactile') || desc.includes('absent'))) {
    return { issueType: 'missing_tactile_path', issueCategory: 'pathway_blockage', schemeCondition: 'not_working', classifiedBy: 'rule_engine' };
  }

  if ((desc.includes('crossing') || desc.includes('zebra')) && (desc.includes('unsafe') || desc.includes('dangerous') || desc.includes('no signal'))) {
    return { issueType: 'unsafe_crossing', issueCategory: 'safety_risk', schemeCondition: 'partially_working', classifiedBy: 'rule_engine' };
  }

  if ((desc.includes('sign') || desc.includes('signage')) && (desc.includes('missing') || desc.includes('no sign') || desc.includes('unclear'))) {
    return { issueType: 'signage_missing', issueCategory: 'signage_problem', schemeCondition: 'partially_working', classifiedBy: 'rule_engine' };
  }

  if (desc.includes('half') || desc.includes('incomplete') || desc.includes('unfinished') || desc.includes('partial')) {
    return { issueType: 'partial_implementation', issueCategory: 'partial_implementation', schemeCondition: 'partially_working', classifiedBy: 'rule_engine' };
  }

  if (desc.includes('ignored') || desc.includes('no action') || desc.includes('officials ignored') || desc.includes('neglect') || desc.includes('nobody cares')) {
    return { issueType: 'ignored_by_officials', issueCategory: 'official_neglect', schemeCondition: 'ignored', classifiedBy: 'rule_engine' };
  }

  if (desc.includes('not started') || desc.includes('never built') || desc.includes('only on paper')) {
    return { issueType: 'scheme_not_started', issueCategory: 'official_neglect', schemeCondition: 'ignored', classifiedBy: 'rule_engine' };
  }

  if (desc.includes('non-functional') || desc.includes('completely broken') || desc.includes('does not work')) {
    return { issueType: 'scheme_non_functional', issueCategory: 'equipment_failure', schemeCondition: 'not_working', classifiedBy: 'rule_engine' };
  }

  return {
    issueType: 'other',
    issueCategory: 'other',
    schemeCondition: 'partially_working',
    classifiedBy: 'rule_engine',
  };
};

module.exports = { classifyReport };
