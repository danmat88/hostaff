import {
  HOSTS,
  HOSTING_TYPE_OPTIONS,
  HOST_TYPE_PROFILE_VERIFICATION,
  HOST_TYPE_PROFILES,
  REVIEWS,
} from '../src/data/hosts.js';

const REQUIRED_PROFILE_KEYS = [
  'planType',
  'tagline',
  'bestFor',
  'priceIntro',
  'priceRenewal',
  'plans',
  'features',
];

const typeIds = HOSTING_TYPE_OPTIONS.map((item) => item.id);
const hostIds = new Set(HOSTS.map((host) => host.id));
const issues = [];

for (const host of HOSTS) {
  const hostProfiles = HOST_TYPE_PROFILES[host.id];
  if (!hostProfiles || typeof hostProfiles !== 'object') {
    issues.push(`Missing host type profiles for '${host.id}'.`);
    continue;
  }

  for (const [typeId, profile] of Object.entries(hostProfiles)) {
    if (!typeIds.includes(typeId)) {
      issues.push(`Unknown hosting type '${typeId}' on host '${host.id}'.`);
      continue;
    }

    for (const key of REQUIRED_PROFILE_KEYS) {
      const value = profile[key];
      if (value === undefined || value === null || value === '') {
        issues.push(`Missing '${key}' in ${host.id}.${typeId}.`);
      }
    }

    if (!Array.isArray(profile.plans) || profile.plans.length === 0) {
      issues.push(`No plans defined in ${host.id}.${typeId}.`);
    }

    if (!Array.isArray(profile.features) || profile.features.length === 0) {
      issues.push(`No features defined in ${host.id}.${typeId}.`);
    }

    const verification = HOST_TYPE_PROFILE_VERIFICATION?.[host.id]?.[typeId];
    if (!verification) {
      issues.push(`Missing verification block for ${host.id}.${typeId}.`);
      continue;
    }

    if (!verification.lastVerified) {
      issues.push(`Missing lastVerified in verification for ${host.id}.${typeId}.`);
    }

    if (!verification.dataSources?.pricing) {
      issues.push(`Missing pricing source in verification for ${host.id}.${typeId}.`);
    }

    const mergedDataSources = {
      ...(host.dataSources || {}),
      ...(verification.dataSources || {}),
      ...(profile.dataSources || {}),
    };

    for (const sourceKey of ['pricing', 'reviews', 'policy', 'infrastructure']) {
      if (!mergedDataSources[sourceKey]) {
        issues.push(`Missing merged '${sourceKey}' source for ${host.id}.${typeId}.`);
      }
    }
  }
}

for (const review of REVIEWS) {
  if (!hostIds.has(review.hostId)) {
    issues.push(`Review ${review.id} points to unknown host '${review.hostId}'.`);
    continue;
  }

  if (!HOST_TYPE_PROFILES?.[review.hostId]?.[review.hostingType]) {
    issues.push(`Review ${review.id} has unsupported type '${review.hostingType}' for '${review.hostId}'.`);
  }
}

for (const typeId of typeIds) {
  const coverage = HOSTS.filter((host) => Boolean(HOST_TYPE_PROFILES?.[host.id]?.[typeId])).length;
  if (coverage === 0) {
    issues.push(`No providers available for hosting type '${typeId}'.`);
  }
}

if (issues.length > 0) {
  console.error('Host data audit failed.');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log('Host data audit passed.');
console.log(`- Providers: ${HOSTS.length}`);
console.log(`- Hosting types: ${HOSTING_TYPE_OPTIONS.length}`);
console.log(`- Reviews validated: ${REVIEWS.length}`);
