'use strict';

// Rule-based scoring. Deliberately not ML: with a catalogue this size a
// transparent score is easier to tune and easier to explain to the buyer,
// which is why every match ships with the reasons that produced it.

const WEIGHTS = {
  category: 40,
  selling: 20,
  style: 15,
  animation: 10,
  feature: 8,
};

const CATEGORY_NEIGHBOURS = {
  ecommerce: ['business'],
  portfolio: ['blog'],
  saas: ['business'],
  restaurant: ['business'],
  business: ['saas'],
  blog: ['portfolio'],
};

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function scoreTemplate(template, brief) {
  const reasons = [];
  let score = 0;

  const wantedFeatures = asArray(brief.features);
  const templateFeatures = Array.isArray(template.features)
    ? template.features
    : JSON.parse(template.features || '[]');

  if (brief.category) {
    if (template.category === brief.category) {
      score += WEIGHTS.category;
      reasons.push('Built for this kind of site');
    } else if ((CATEGORY_NEIGHBOURS[brief.category] || []).includes(template.category)) {
      score += WEIGHTS.category * 0.4;
      reasons.push('Adapts to this kind of site');
    }
  }

  if (brief.selling) {
    if (template.selling === brief.selling) {
      score += WEIGHTS.selling;
      reasons.push(sellingReason(brief.selling));
    } else if (brief.selling === 'none' || template.selling === 'none') {
      score += WEIGHTS.selling * 0.25;
    }
  }

  if (brief.style && template.style === brief.style) {
    score += WEIGHTS.style;
    reasons.push(`${capitalise(template.style)} styling`);
  }

  if (brief.animation) {
    if (template.animation === brief.animation) {
      score += WEIGHTS.animation;
      reasons.push(animationReason(template.animation));
    } else if (isAdjacentAnimation(brief.animation, template.animation)) {
      score += WEIGHTS.animation * 0.5;
    }
  }

  const matchedFeatures = wantedFeatures.filter((f) => templateFeatures.includes(f));
  if (matchedFeatures.length) {
    score += matchedFeatures.length * WEIGHTS.feature;
    reasons.push(`Includes ${matchedFeatures.length} of the ${wantedFeatures.length} features you asked for`);
  }

  const missingFeatures = wantedFeatures.filter((f) => !templateFeatures.includes(f));

  return { score: Math.round(score), reasons, matchedFeatures, missingFeatures };
}

function sellingReason(selling) {
  switch (selling) {
    case 'physical': return 'Laid out for physical products';
    case 'digital': return 'Laid out for digital products';
    case 'services': return 'Laid out for selling services';
    default: return 'No storefront to get in the way';
  }
}

function animationReason(animation) {
  switch (animation) {
    case 'rich': return 'Motion throughout';
    case 'subtle': return 'Restrained motion';
    default: return 'No animation';
  }
}

function isAdjacentAnimation(a, b) {
  const order = ['none', 'subtle', 'rich'];
  return Math.abs(order.indexOf(a) - order.indexOf(b)) === 1;
}

function capitalise(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Rank the catalogue against a brief.
 * @param {Array} templates rows from the templates table
 * @param {Object} brief    answers from the onboarding quiz
 * @param {Object} [opts]   { limit }
 */
function recommend(templates, brief = {}, opts = {}) {
  const limit = opts.limit || 4;
  const maxScore = maxPossibleScore(brief);

  const ranked = templates
    .map((template) => {
      const result = scoreTemplate(template, brief);
      return {
        template,
        ...result,
        fit: maxScore ? Math.min(100, Math.round((result.score / maxScore) * 100)) : 0,
      };
    })
    .sort((a, b) => b.score - a.score || a.template.sort_order - b.template.sort_order);

  return ranked.slice(0, limit);
}

function maxPossibleScore(brief) {
  let max = 0;
  if (brief.category) max += WEIGHTS.category;
  if (brief.selling) max += WEIGHTS.selling;
  if (brief.style) max += WEIGHTS.style;
  if (brief.animation) max += WEIGHTS.animation;
  max += asArray(brief.features).length * WEIGHTS.feature;
  return max;
}

module.exports = { recommend, scoreTemplate, WEIGHTS };
